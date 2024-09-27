const User = require('../models/User');
const { createSecretToken } = require('../util/SecretToken');
const bcrypt = require('bcrypt');

module.exports.Signup = async (req, res) => {
    try {
        const { email, password, username } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ email, password: hashedPassword, username, createdAt: new Date() });
        console.log('Created User:', user); // Log the created user object

        const token = createSecretToken(user._id);
        
        res.cookie('token', token, {
            httpOnly: true, // Ensure that it's not accessible via JavaScript
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        });

        return res.status(201).json({ message: "User created successfully", success: true, user });
    } catch (err) {
        console.error("Signup Error:", err); // Log error details
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

module.exports.Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check if the password matches
        const auth = await bcrypt.compare(password, user.password);
        console.log('Password Check:', { inputPassword: password, dbPassword: user.password, isMatch: auth }); // Log comparison results
        
        if (!auth) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = createSecretToken(user._id);
        res.cookie('token', token, {
            httpOnly: true, // Ensure that it's not accessible via JavaScript
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        });

        return res.status(200).json({ message: 'User logged in successfully', success: true, user });
    } catch (err) {
        console.error("Login Error:", err); // Log error details
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};
