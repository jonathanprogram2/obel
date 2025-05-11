const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        const user = await newUser.save();
        res.status(201).json(user);
    } catch (err) {
        console.error("❌ Signup error:", err);
        res.status(500).json("Signup error: " + err.message);
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(400).json('Wrong credentials');

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json('Wrong credentials');

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d'}
        );

        res.status(200).json({ user, token });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;