const express = require('express');
const User = require('../model/User');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) 
            return res.status(400).json({ msg: 'User already exists' });

        user = new User({ email, password });
        await user.save();

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) 
            return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) 
            return res.status(400).json({ msg: 'Invalid credentials' });

        res.status(200).json({ msg: 'Login successful' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;