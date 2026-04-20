const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');

// 🟢 Consolidated all imports into one clean block
const { 
  loginUser, 
  signupUser, 
  updateSettings, 
  changePassword,
  generate2FA, 
  verifyAndEnable2FA,
  forgotPassword, // NEW
  resetPassword,   // NEW
  getAllUsers
} = require('../controllers/userController');

// login route
router.post('/login', loginUser);

// signup route
router.post('/signup', signupUser);

// 🟢 NEW: Password Reset Routes (Must be public, placed before requireAuth)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// ----------------------------------------------------------------------
// By putting requireAuth here, any route below this line requires a valid token
router.use(requireAuth);
// ----------------------------------------------------------------------

// update settings route
router.put('/settings', updateSettings);

// change password route
router.put('/change-password', changePassword);

// generate 2FA route
router.post('/2fa/generate', generate2FA);

// verify and enable 2FA route
router.post('/2fa/verify', verifyAndEnable2FA);

// get all users (Admin only)
router.get('/all', getAllUsers);

module.exports = router;