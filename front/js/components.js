// Chargement des composants
async function loadComponent(elementId, componentPath, callback) {
    try {
        const response = await fetch(componentPath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
        if (callback) callback();
    } catch (error) {
        console.error('Erreur chargement composant:', error);
    }
}

// Header
function initHeader(config = {}) {
    const header = `
        <header class="glass-header">
            <div class="container-fluid d-flex justify-content-between align-items-center py-3">
                <a href="index.html" class="logo-link">
                    <img src="logo.svg" alt="DWWM ReviZ" class="app-logo">
                </a>
                ${config.timer ? '<div class="timer-wrapper"><div id="timer" class="timer">00:00</div></div>' : ''}
                <div class="header-actions">
                    ${config.userInfo ? '<span class="user-info me-3"></span>' : ''}
                    ${config.adminBtn ? '<button id="adminBtn" class="btn-admin me-2">Admin</button>' : ''}
                    ${config.backBtn ? '<button id="backToAdmin" class="btn btn-secondary me-2">← Admin</button>' : ''}
                    ${config.backToApp ? '<button id="backToApp" class="btn btn-secondary me-2">← Retour</button>' : ''}
                    ${config.usersBtn ? '<button id="usersBtn" class="btn btn-secondary me-2">Utilisateurs</button>' : ''}
                    ${config.logout ? '<button id="logoutBtn" class="btn btn-danger">Déconnexion</button>' : ''}
                </div>
            </div>
        </header>
    `;
    document.getElementById('app-header').innerHTML = header;
}

// Footer
function initFooter() {
    const footer = `
        <footer class="text-center py-3">
            <img src="logo.svg" alt="DWWM ReviZ" class="footer-logo mb-2">
            <p class="mb-0">&copy; ${new Date().getFullYear()} by Kydo</p>
        </footer>
    `;
    document.getElementById('app-footer').innerHTML = footer;
}
