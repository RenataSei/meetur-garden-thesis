const express = require('express');
const { loginUser, signupUser, updateSettings, changePassword } = require('../controllers/userController');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const { generate2FA, verifyAndEnable2FA } = require('../controllers/userController');
// login route
router.post('/login', loginUser);

// signup route
router.post('/signup', signupUser);

// By putting requireAuth here, any route below this line requires a valid token
router.use(requireAuth);

// update settings route
router.put('/settings', updateSettings);

// change password route
router.put('/change-password', changePassword);

// generate 2FA route
router.post('/2fa/generate', generate2FA);

// verify and enable 2FA route
router.post('/2fa/verify', verifyAndEnable2FA);

module.exports = router;