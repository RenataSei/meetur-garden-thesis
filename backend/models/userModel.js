const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  settings: {
    tempUnit: { type: String, default: "Celsius" },
    alertsEnabled: { type: Boolean, default: true },
    hapticsEnabled: { type: Boolean, default: true },
    // 🟢 NEW: The manual location override field!
    customLocation: { type: String, default: "" }
  },
  // --- Role Field ---
  role: {
    type: String,
    enum: ['user', 'admin'], // Only allow these two values
    default: 'user'          // Default to 'user' if not specified
  },

  // --- 2FA Fields ---
  twoFactorSecret: {
    type: String,
    default: null
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Static signup method
userSchema.statics.signup = async function(email, password, role) { // Accept role here
  if (!email || !password) {
    throw new Error('All fields must be filled');
  }
  if (!validator.isEmail(email)) {
    throw new Error('Email is not valid');
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error('Password not strong enough');
  }

  const exists = await this.findOne({ email });
  if (exists) {
    throw new Error('Email already in use');
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  // Save the user with the provided role (or default)
  const user = await this.create({ email, password: hash, role });

  return user;
}

// Static login method (unchanged, but returns the user doc)
userSchema.statics.login = async function(email, password) {
  if (!email || !password) {
    throw new Error('All fields must be filled');
  }

  const user = await this.findOne({ email });
  if (!user) {
    throw new Error('Incorrect email');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error('Incorrect password');
  }

  return user;
}

// Static change password method
userSchema.statics.changePassword = async function(_id, currentPassword, newPassword) {
  // 1. Validation
  if (!currentPassword || !newPassword) {
    throw new Error('Both current and new passwords must be filled');
  }
  if (!validator.isStrongPassword(newPassword)) {
    throw new Error('New password is not strong enough');
  }

  // 2. Find the user
  const user = await this.findById(_id);
  if (!user) {
    throw new Error('User not found');
  }

  // 3. Verify the current password
  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    throw new Error('Incorrect current password');
  }

  // 4. Hash the new password and save
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);

  user.password = hash;
  await user.save();

  return user;
}

module.exports = mongoose.model('User', userSchema);