let questions = [];
let filteredQuestions = [];
let currentEditingQuestion = null;

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token || user.role !== 'admin') {
    window.location.href = 'login.html';
}

async function loadQuestions() {
    try {
        const response = await fetch(`${window.API_BASE_URL}/api/questions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401) {
            localStorage.clear();
            window.location.href = 'login.html';
            return;
        }
        const data = await response.json();
        questions = data.questions;
    } catch (error) {
        console.error('Erreur chargement questions:', error);
        alert('Erreur de connexion au serveur');
    }
    filteredQuestions = [...questions];
    populateCompetenceFilter();
    renderQuestions();
}

async function saveQuestion(questionData, isUpdate = false) {
    try {
        const url = isUpdate 
            ? `${window.API_BASE_URL}/api/questions/${questionData.id}`
            : `${window.API_BASE_URL}/api/questions`;
        const method = isUpdate ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(questionData)
        });
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Erreur sauvegarde:', error);
        return false;
    }
}

async function deleteQuestionAPI(id) {
    try {
        const response = await fetch(`${window.API_BASE_URL}/api/questions/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Erreur suppression:', error);
        return false;
    }
}

function populateCompetenceFilter() {
    const competences = [...new Set(questions.map(q => q.competence))].sort();
    const select = document.getElementById('competenceFilter');
    competences.forEach(comp => {
        const option = document.createElement('option');
        option.value = comp;
        option.textContent = comp;
        select.appendChild(option);
    });
}

function filterQuestions() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const competence = document.getElementById('competenceFilter').value;
    const niveau = document.getElementById('niveauFilterAdmin').value;

    filteredQuestions = questions.filter(q => {
        const matchSearch = !search || 
            q.question.toLowerCase().includes(search) || 
            q.reponse.toLowerCase().includes(search) ||
            q.id.toLowerCase().includes(search);
        const matchCompetence = !competence || q.competence === competence;
        const matchNiveau = !niveau || q.niveau === parseInt(niveau);
        return matchSearch && matchCompetence && matchNiveau;
    });

    renderQuestions();
}

function renderQuestions() {
    const grid = document.getElementById('questionsGrid');
    grid.innerHTML = '';

    if (filteredQuestions.length === 0) {
        grid.innerHTML = '<p class="text-center text-secondary">Aucune question trouvée</p>';
        return;
    }

    filteredQuestions.forEach(q => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.onclick = () => openQuestionModal(q);
        
        const questionNum = q.id.replace(/^Q0*/, '');
        const displayId = `Q${questionNum.padStart(3, '0')}`;
        
        card.innerHTML = `
            <div class="card-header-info">
                <span class="card-competence">${q.competence}</span>
                <span class="card-niveau">Niveau ${q.niveau}</span>
            </div>
            <div class="card-question">${q.question}</div>
            <div class="card-answer-preview">${q.reponse}</div>
            <div class="card-footer-info">
                <span class="card-id">${displayId}</span>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function openQuestionModal(question = null) {
    const modal = document.getElementById('questionDetailModal');
    const form = document.getElementById('questionForm');
    
    if (question) {
        currentEditingQuestion = question;
        document.getElementById('modalTitle').textContent = 'Modifier la question';
        document.getElementById('questionId').value = question.id;
        document.getElementById('questionCompetence').value = question.competence;
        document.getElementById('questionNiveau').value = question.niveau;
        document.getElementById('questionText').value = question.question;
        document.getElementById('questionReponse').value = question.reponse;
        document.getElementById('deleteQuestion').style.display = 'block';
    } else {
        currentEditingQuestion = null;
        document.getElementById('modalTitle').textContent = 'Nouvelle question';
        form.reset();
        const newId = `Q${String(questions.length + 1).padStart(3, '0')}`;
        document.getElementById('questionId').value = newId;
        document.getElementById('deleteQuestion').style.display = 'none';
    }
    
    modal.classList.add('show');
}

function closeModal() {
    document.getElementById('questionDetailModal').classList.remove('show');
    currentEditingQuestion = null;
}

async function saveQuestionForm(e) {
    e.preventDefault();
    
    const questionData = {
        id: document.getElementById('questionId').value,
        competence: document.getElementById('questionCompetence').value,
        niveau: parseInt(document.getElementById('questionNiveau').value),
        question: document.getElementById('questionText').value,
        reponse: document.getElementById('questionReponse').value
    };

    const saved = await saveQuestion(questionData, !!currentEditingQuestion);
    if (saved) {
        alert('Question enregistrée !');
        closeModal();
        await loadQuestions();
    } else {
        alert('Erreur lors de la sauvegarde');
    }
}

async function deleteQuestion() {
    if (!currentEditingQuestion) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer la question ${currentEditingQuestion.id} ?`)) {
        const deleted = await deleteQuestionAPI(currentEditingQuestion.id);
        if (deleted) {
            alert('Question supprimée !');
            closeModal();
            await loadQuestions();
        } else {
            alert('Erreur lors de la suppression');
        }
    }
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageHeight = 280;
    const marginTop = 20;
    const marginBottom = 20;
    
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 297, 'F');
    
    let y = marginTop;
    doc.setTextColor(0, 123, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('DWWM ReviZ', 105, y, { align: 'center' });
    y += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 191, 255);
    doc.text(`Questions - ${new Date().getFullYear()} by Kydo`, 105, y, { align: 'center' });
    
    doc.setDrawColor(0, 123, 255);
    doc.setLineWidth(0.5);
    doc.line(20, y + 3, 190, y + 3);
    y += 15;

    filteredQuestions.forEach((q, index) => {
        const headerLines = doc.splitTextToSize(`${q.id} - ${q.competence} - Niveau ${q.niveau}`, 170);
        const questionLines = doc.splitTextToSize(q.question, 165);
        const reponseLines = doc.splitTextToSize(`Réponse: ${q.reponse}`, 165);
        const totalHeight = headerLines.length * 7 + questionLines.length * 5 + reponseLines.length * 5 + 20;
        
        if (y + totalHeight > pageHeight - marginBottom) {
            doc.addPage();
            doc.setFillColor(0, 0, 0);
            doc.rect(0, 0, 210, 297, 'F');
            y = marginTop;
        }

        doc.setDrawColor(0, 123, 255);
        doc.setLineWidth(0.5);
        doc.roundedRect(18, y - 5, 174, totalHeight - 5, 3, 3, 'S');

        doc.setTextColor(0, 191, 255);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(headerLines, 22, y);
        y += headerLines.length * 7;

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(questionLines, 25, y);
        y += questionLines.length * 5 + 5;

        doc.setTextColor(0, 191, 255);
        doc.setFont(undefined, 'italic');
        doc.text(reponseLines, 25, y);
        y += reponseLines.length * 5 + 15;
    });

    doc.save('dwwm_reviz_questions.pdf');
}

document.getElementById('searchInput').addEventListener('input', filterQuestions);
document.getElementById('competenceFilter').addEventListener('change', filterQuestions);
document.getElementById('niveauFilterAdmin').addEventListener('change', filterQuestions);
document.getElementById('addQuestion').addEventListener('click', () => openQuestionModal());
document.querySelector('.close').addEventListener('click', closeModal);
document.getElementById('questionForm').addEventListener('submit', saveQuestionForm);
document.getElementById('deleteQuestion').addEventListener('click', deleteQuestion);
document.getElementById('exportPDF').addEventListener('click', exportToPDF);
document.getElementById('backToApp').addEventListener('click', () => {
    window.location.href = 'index.html';
});

document.getElementById('usersBtn')?.addEventListener('click', () => {
    window.location.href = 'users.html';
});

document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
});

window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('questionDetailModal')) {
        closeModal();
    }
});

loadQuestions();
