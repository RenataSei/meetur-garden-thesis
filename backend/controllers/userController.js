const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const createToken = (_id) => {
  return jwt.sign({_id}, process.env.SECRET, { expiresIn: '3d' });
}

// login user
const loginUser = async (req, res) => {
  const {email, password} = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);

    // --- NEW: Send the role back to the frontend ---
    res.status(200).json({email, role: user.role, token}); 
  } catch (error) {
    res.status(400).json({error: error.message});
  }
}

// signup user
const signupUser = async (req, res) => {
  // Accept 'role' from the request body
  const {email, password, role} = req.body; 

  try {
    // Pass role to the model
    const user = await User.signup(email, password, role); 
    const token = createToken(user._id);

    // --- NEW: Send the role back to the frontend ---
    res.status(200).json({email, role: user.role, token}); 
  } catch (error) {
    res.status(400).json({error: error.message});
  }
}

module.exports = { signupUser, loginUser };