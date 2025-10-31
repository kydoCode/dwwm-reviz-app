const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'
    : 'https://your-backend-url.vercel.app';

export default API_URL;
