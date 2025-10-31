require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('../models/User');
const Question = require('../models/Question');
const fs = require('fs').promises;
const path = require('path');

let rl;

const question = (query) => new Promise((resolve) => {
    if (!rl) {
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }
    rl.question(query, resolve);
});

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connecté\n');

        console.log('🔐 Création d\'un utilisateur admin\n');
        const username = await question('Nom d\'utilisateur admin: ');
        const password = await question('Mot de passe (min 8 caractères): ');
        
        if (password.length < 8) {
            console.log('❌ Le mot de passe doit contenir au moins 8 caractères');
            process.exit(1);
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('❌ Cet utilisateur existe déjà');
            process.exit(1);
        }

        const admin = new User({ username, password, role: 'admin' });
        await admin.save();
        console.log(`\n✅ Admin créé (username: ${username})`);

        const questionsFile = path.join(__dirname, '../data/questions.json');
        const data = await fs.readFile(questionsFile, 'utf8');
        const { questions } = JSON.parse(data);
        
        const count = await Question.countDocuments();
        if (count === 0) {
            await Question.insertMany(questions);
            console.log(`✅ ${questions.length} questions importées`);
        } else {
            console.log(`ℹ️  ${count} questions déjà présentes`);
        }

        console.log('\n🎉 Initialisation terminée !');
        if (rl) rl.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        if (rl) rl.close();
        process.exit(1);
    }
};

createAdmin();
