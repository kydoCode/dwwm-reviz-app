let questions = [];
let usedQuestions = [];
let currentQuestion = null;
let timerInterval = null;
let timerSeconds = 0;
let isPaused = false;

const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}

async function loadSession() {
    try {
        const response = await fetch(`${window.API_BASE_URL}/api/session`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.session) {
            usedQuestions = data.session.usedQuestions || [];
            timerSeconds = data.session.timerSeconds || 0;
            document.getElementById('timerDuration').value = data.session.timerDuration || 30;
        }
    } catch (error) {
        console.error('Erreur chargement session:', error);
    }
}

async function saveSession() {
    try {
        await fetch(`${window.API_BASE_URL}/api/session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                usedQuestions,
                timerSeconds,
                timerDuration: parseInt(document.getElementById('timerDuration').value)
            })
        });
    } catch (error) {
        console.error('Erreur sauvegarde session:', error);
    }
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
        await loadSession();
        
        if (timerSeconds > 0) {
            startTimer();
        }
    } catch (error) {
        console.error('Erreur chargement questions:', error);
        alert('Erreur: Assurez-vous que le serveur backend est démarré');
    }
    updateQuestionCounter();
}

function formatTime(seconds) {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    const sign = seconds < 0 ? '-' : '';
    return `${sign}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateTimerDisplay() {
    const totalSeconds = parseInt(document.getElementById('timerDuration').value) * 60;
    const remaining = totalSeconds - timerSeconds;
    const timeStr = formatTime(remaining);
    
    document.getElementById('timer').textContent = timeStr;
    const modalTimer = document.getElementById('modalTimer');
    if (modalTimer) {
        modalTimer.textContent = timeStr;
    }
    
    if (remaining <= 300 && remaining > 0) {
        document.getElementById('timer').classList.add('warning');
        if (modalTimer) modalTimer.classList.add('warning');
    } else {
        document.getElementById('timer').classList.remove('warning');
        if (modalTimer) modalTimer.classList.remove('warning');
    }
    
    if (remaining <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerSeconds = 0;
        isPaused = false;
        saveSession();
        alert('⏰ Temps écoulé !');
        const btn = document.getElementById('startTimer');
        btn.textContent = 'Démarrer';
        btn.onclick = startTimer;
        updateTimerDisplay();
    }
}

function startTimer() {
    if (timerInterval) return;
    isPaused = false;
    const btn = document.getElementById('startTimer');
    btn.textContent = 'Pause';
    btn.onclick = pauseTimer;
    
    const modalBtn = document.getElementById('pauseTimer');
    if (modalBtn) {
        modalBtn.textContent = '⏸';
        modalBtn.onclick = pauseTimer;
    }
    
    timerInterval = setInterval(() => {
        if (!isPaused) {
            timerSeconds++;
            updateTimerDisplay();
            if (timerSeconds % 10 === 0) {
                saveSession();
            }
        }
    }, 1000);
}

function pauseTimer() {
    if (!timerInterval) {
        startTimer();
        return;
    }
    
    isPaused = !isPaused;
    const btn = document.getElementById('startTimer');
    const modalBtn = document.getElementById('pauseTimer');
    
    if (isPaused) {
        btn.textContent = 'Reprendre';
        btn.onclick = resumeTimer;
        if (modalBtn) {
            modalBtn.textContent = '▶';
            modalBtn.onclick = resumeTimer;
        }
    } else {
        btn.textContent = 'Pause';
        btn.onclick = pauseTimer;
        if (modalBtn) {
            modalBtn.textContent = '⏸';
            modalBtn.onclick = pauseTimer;
        }
    }
}

function resumeTimer() {
    isPaused = false;
    const btn = document.getElementById('startTimer');
    const modalBtn = document.getElementById('pauseTimer');
    
    btn.textContent = 'Pause';
    btn.onclick = pauseTimer;
    if (modalBtn) {
        modalBtn.textContent = '⏸';
        modalBtn.onclick = pauseTimer;
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerSeconds = 0;
    isPaused = false;
    updateTimerDisplay();
    saveSession();
    const btn = document.getElementById('startTimer');
    btn.textContent = 'Démarrer';
    btn.onclick = startTimer;
    
    const modalBtn = document.getElementById('pauseTimer');
    if (modalBtn) {
        modalBtn.textContent = '▶';
        modalBtn.onclick = startTimer;
    }
}



function getFilteredQuestions() {
    const niveau = document.getElementById('niveauFilter').value;
    let filtered = questions.filter(q => !usedQuestions.includes(q.id));
    if (niveau !== 'tous') {
        filtered = filtered.filter(q => q.niveau === parseInt(niveau));
    }
    return filtered;
}

function rollDice() {
    const dice = document.getElementById('dice3D');
    dice.classList.add('rolling');
    setTimeout(() => {
        dice.classList.remove('rolling');
        showRandomQuestion();
    }, 600);
}

function showRandomQuestion() {
    const filtered = getFilteredQuestions();
    if (filtered.length === 0) {
        alert('Aucune question disponible. Réinitialisez les questions.');
        return;
    }
    
    currentQuestion = filtered[Math.floor(Math.random() * filtered.length)];
    usedQuestions.push(currentQuestion.id);
    updateQuestionCounter();
    saveSession();
    
    const nbEtudiants = parseInt(document.getElementById('nbEtudiants').value);
    const studentNum = Math.floor(Math.random() * nbEtudiants) + 1;
    
    const questionNum = currentQuestion.id.replace(/^Q0*/, '');
    document.getElementById('questionNumber').textContent = questionNum.padStart(3, '0');
    document.getElementById('studentNumber').textContent = studentNum;
    document.getElementById('competence').textContent = currentQuestion.competence;
    document.getElementById('niveau').textContent = `Niveau ${currentQuestion.niveau}`;
    document.getElementById('questionText').textContent = currentQuestion.question;
    
    const optionsSection = document.getElementById('optionsSection');
    optionsSection.innerHTML = '';
    if (currentQuestion.options) {
        currentQuestion.options.forEach((opt, idx) => {
            const div = document.createElement('div');
            div.className = 'option-flip';
            div.textContent = `Option ${String.fromCharCode(65 + idx)}: ${opt}`;
            optionsSection.appendChild(div);
        });
    }
    
    document.getElementById('answerText').textContent = currentQuestion.reponse;
    document.getElementById('answerSection').style.display = 'none';
    document.getElementById('showAnswer').style.display = 'block';
    
    const modalBtn = document.getElementById('pauseTimer');
    if (timerInterval) {
        if (isPaused) {
            modalBtn.textContent = '▶';
            modalBtn.onclick = resumeTimer;
        } else {
            modalBtn.textContent = '⏸';
            modalBtn.onclick = pauseTimer;
        }
    } else {
        modalBtn.textContent = '▶';
        modalBtn.onclick = startTimer;
    }
    
    document.getElementById('questionModal').classList.add('show');
}

function showAnswer() {
    document.getElementById('answerSection').style.display = 'block';
    document.getElementById('showAnswer').style.display = 'none';
}

function closeModal() {
    document.getElementById('questionModal').classList.remove('show');
}

function validateAndNext() {
    if (timerInterval && !isPaused) {
        pauseTimer();
    }
    closeModal();
}

function resetQuestions() {
    usedQuestions = [];
    updateQuestionCounter();
    saveSession();
    alert('Questions réinitialisées');
}

function updateQuestionCounter() {
    const remaining = questions.length - usedQuestions.length;
    document.getElementById('questionCounter').textContent = `${remaining} / ${questions.length}`;
}

const user = JSON.parse(localStorage.getItem('user') || '{}');
const userInfoEl = document.querySelector('.user-info');
if (userInfoEl) {
    userInfoEl.textContent = `👤 ${user.username} (${user.role})`;
}

document.getElementById('startTimer').addEventListener('click', startTimer);
document.getElementById('resetTimer').addEventListener('click', resetTimer);
document.getElementById('adminBtn').addEventListener('click', () => {
    if (user.role === 'admin') {
        window.location.href = 'admin.html';
    } else {
        alert('Accès admin requis');
    }
});

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });
}

document.getElementById('resetQuestions').addEventListener('click', resetQuestions);
document.getElementById('dice3D').addEventListener('click', rollDice);
document.querySelector('.close').addEventListener('click', closeModal);
document.getElementById('showAnswer').addEventListener('click', showAnswer);
document.getElementById('validateNext').addEventListener('click', validateAndNext);
document.getElementById('resetModalTimer').addEventListener('click', resetTimer);


window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('questionModal')) {
        closeModal();
    }
});

updateTimerDisplay();

loadQuestions();
