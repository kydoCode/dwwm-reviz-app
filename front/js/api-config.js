// Configuration de l'API selon l'environnement
const API_CONFIG = {
    // URL de production Vercel
    // PRODUCTION_URL: 'https://dwwm-reviz-app-backend.vercel.app',
    // PRODUCTION_URL: 'https://dwwm-reviz-app-backend-[hash].vercel.app',
    PRODUCTION_URL: 'https://dwwm-reviz-app-backend-ejmbknxe1-kydokody-gmailcoms-projects.vercel.app',
    DEVELOPMENT_URL: 'http://localhost:3000',
    
    // Détection automatique de l'environnement
    getBaseURL: function() {
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        return isLocalhost ? this.DEVELOPMENT_URL : this.PRODUCTION_URL;
    }
};

// Export de l'URL de base
window.API_BASE_URL = API_CONFIG.getBaseURL();

console.log('🔗 API URL:', window.API_BASE_URL);
