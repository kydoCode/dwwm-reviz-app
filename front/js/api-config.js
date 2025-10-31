// Configuration de l'API selon l'environnement
const API_CONFIG = {
    // En production, remplacer par votre URL Vercel
    PRODUCTION_URL: 'https://your-backend-url.vercel.app',
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
