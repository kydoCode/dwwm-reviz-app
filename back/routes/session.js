const express = require('express');
const Session = require('../models/Session');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        let session = await Session.findOne({ userId: req.user.userId });
        if (!session) {
            session = new Session({ userId: req.user.userId });
            await session.save();
        }
        res.json({ session });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { usedQuestions, timerSeconds, timerDuration } = req.body;
        let session = await Session.findOne({ userId: req.user.userId });
        
        if (!session) {
            session = new Session({ userId: req.user.userId });
        }
        
        if (usedQuestions !== undefined) session.usedQuestions = usedQuestions;
        if (timerSeconds !== undefined) session.timerSeconds = timerSeconds;
        if (timerDuration !== undefined) session.timerDuration = timerDuration;
        session.updatedAt = Date.now();
        
        await session.save();
        res.json({ success: true, session });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
