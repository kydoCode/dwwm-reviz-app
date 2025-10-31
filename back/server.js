require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const questionRoutes = require('./routes/questions');
const sessionRoutes = require('./routes/session');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [
        process.env.FRONTEND_URL,
        'https://dwwm-reviz-app-frontend.vercel.app',
        'https://dwwm-reviz-frontend.vercel.app'
      ].filter(Boolean)
    : ['http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:5500', 'http://localhost:8080', 'http://127.0.0.1:8080'];

app.use(cors({
    origin: (origin, callback) => {
        // Permettre les requêtes sans origine (Postman, curl, etc.)
        if (!origin) {
            return callback(null, true);
        }
        
        // Vérifier si l'origine est autorisée
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Log pour debug
        console.log('❌ CORS blocked origin:', origin);
        console.log('✅ Allowed origins:', allowedOrigins);
        
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Trop de requêtes, réessayez plus tard',
    keyGenerator: (req) => {
        return req.ip || req.connection.remoteAddress || 'unknown';
    },
    skip: (req) => process.env.NODE_ENV === 'production' // Désactiver en prod pour éviter les erreurs Vercel
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Trop de tentatives de connexion',
    keyGenerator: (req) => {
        return req.ip || req.connection.remoteAddress || 'unknown';
    },
    skip: (req) => process.env.NODE_ENV === 'production' // Désactiver en prod pour éviter les erreurs Vercel
});
app.use('/api/auth/login', authLimiter);

// Middleware pour gérer les requêtes preflight OPTIONS
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});

app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/session', sessionRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
    console.log(`🔒 Mode: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
