const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token || user.role !== 'admin') {
    window.location.href = 'login.html';
}

async function loadUsers() {
    try {
        const response = await fetch(`${window.API_BASE_URL}/api/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        const tbody = document.getElementById('usersTable');
        tbody.innerHTML = data.users.map(u => `
            <tr>
                <td>${u.username}</td>
                <td><span class="badge" style="background: ${u.role === 'admin' ? 'linear-gradient(135deg, #ff4444, #cc0000)' : 'linear-gradient(135deg, #007BFF, #00BFFF)'}; color: #fff; border: 1px solid ${u.role === 'admin' ? '#ff4444' : '#007BFF'};">${u.role}</span></td>
                <td>${new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${u._id}')">Supprimer</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Erreur:', error);
    }
}

document.getElementById('addUser').addEventListener('click', () => {
    document.getElementById('userModal').classList.add('show');
});

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('userModal').classList.remove('show');
});

document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ username, password, role })
        });
        
        if (response.ok) {
            alert('Utilisateur créé !');
            document.getElementById('userModal').classList.remove('show');
            document.getElementById('userForm').reset();
            loadUsers();
        } else {
            alert('Erreur lors de la création');
        }
    } catch (error) {
        alert('Erreur de connexion');
    }
});

async function deleteUser(id) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/api/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            alert('Utilisateur supprimé');
            loadUsers();
        }
    } catch (error) {
        alert('Erreur');
    }
}

document.getElementById('backToAdmin').addEventListener('click', () => {
    window.location.href = 'admin.html';
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
});

loadUsers();
