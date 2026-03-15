const express = require('express');
const { loginUser, signupUser } = require('../controllers/userController');

const router = express.Router();
const requireAuth = require('../middleware/requireAuth');

// login route
router.post('/login', loginUser);

// signup route
router.post('/signup', signupUser);

// By putting requireAuth here, any route below this line requires a valid token
router.use(requireAuth);

// update settings route
router.put('/settings', updateSettings);
module.exports = router;