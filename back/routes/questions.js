const express = require('express');
const Question = require('../models/Question');
const { auth, adminOnly } = require('../middleware/auth');
const { backupMiddleware } = require('../middleware/backup');

const router = express.Router();

router.use(backupMiddleware);

router.get('/', auth, async (req, res) => {
    try {
        const questions = await Question.find().sort({ id: 1 });
        res.json({ questions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const question = new Question(req.body);
        await question.save();
        res.json({ success: true, question });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
    try {
        const question = await Question.findOneAndUpdate(
            { id: req.params.id },
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        res.json({ success: true, question });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        await Question.findOneAndDelete({ id: req.params.id });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
