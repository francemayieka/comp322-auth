const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Initialize app and environment variables
dotenv.config();
const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));

// Listen on port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
