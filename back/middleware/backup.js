const fs = require('fs').promises;
const path = require('path');
const Question = require('../models/Question');

const BACKUP_DIR = path.join(__dirname, '../data/backups');

const createBackup = async () => {
    try {
        await fs.mkdir(BACKUP_DIR, { recursive: true });
        
        const questions = await Question.find().lean();
        
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = now.getFullYear().toString().slice(-2);
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        const timestamp = `${dd}${mm}${yy}_${hh}${min}${ss}`;
        
        const backupFile = path.join(BACKUP_DIR, `questions_backup_${timestamp}.json`);
        await fs.writeFile(backupFile, JSON.stringify({ questions }, null, 2));
        
        console.log(`💾 Backup créé: ${backupFile}`);
        return backupFile;
    } catch (error) {
        console.error('❌ Erreur backup:', error);
    }
};

const backupMiddleware = async (req, res, next) => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        await createBackup();
    }
    next();
};

module.exports = { backupMiddleware, createBackup };
