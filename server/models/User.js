const mongoose = require('mongoose');

// Define the User schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetToken: String,
  resetTokenExpire: Date,
}, { timestamps: true });

// Export the model
module.exports = mongoose.model('User', UserSchema);
