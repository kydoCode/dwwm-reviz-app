require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');
const fs = require('fs').promises;
const path = require('path');

const syncToRemote = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/dwwm_reviz');
        console.log('✅ Connecté à MongoDB local');

        const localQuestions = await Question.find();
        console.log(`📦 ${localQuestions.length} questions trouvées en local`);

        await mongoose.disconnect();
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connecté à MongoDB remote');

        await Question.deleteMany({});
        await Question.insertMany(localQuestions);
        console.log(`✅ ${localQuestions.length} questions synchronisées vers remote`);

        console.log('\n🎉 Synchronisation terminée !');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
};

syncToRemote();
