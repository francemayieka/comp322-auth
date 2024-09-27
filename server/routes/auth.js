const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();
const router = express.Router();

// OAuth2 setup for Gmail
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,        // Google Client ID
  process.env.CLIENT_SECRET,    // Google Client Secret
  process.env.REDIRECT_URL      // Redirect URL for OAuth2 Playground (or your app's URL)
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
});

// =============================
// Signup Route
// =============================
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists by email
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new user
    user = new User({
      name,
      email,
      password: hashedPassword
    });
    await user.save();

    // Generate a JWT token for authentication
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// =============================
// Login Route
// =============================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare entered password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// =============================
// Password Recovery - Request Reset Link
// =============================
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    // Create a reset token with a short expiry time (e.g., 15 minutes)
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // Save the token and expiration in the user's document for verification later
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 15 * 60 * 1000; // Token expires in 15 minutes
    await user.save();

    // Get access token using OAuth2
    const accessToken = await oauth2Client.getAccessToken();

    // Setup Nodemailer to send the email with OAuth2
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken.token
      },
      debug: true, // Enable debug output
      logger: true // Enable logger
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Password Reset',
      text: `You requested a password reset. Use this token: ${resetToken}`
    };

    // Send email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ msg: 'Error sending email' });
      } else {
        console.log('Email sent:', info.response);
        res.status(200).json({ msg: 'Password reset email sent' });
      }
    });
  } catch (error) {
    console.error('Error during password reset request:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// =============================
// Password Reset (Verification and Token Expiration will be handled here in the frontend)
// =============================
// TODO: Add reset route to actually change the password after verifying the resetToken

module.exports = router;