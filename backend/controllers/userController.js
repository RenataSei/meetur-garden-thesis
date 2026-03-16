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
    res.status(200).json({email, role: user.role, settings: user.settings, token}); 
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

    // --- NEW: Send the role and settings back to the frontend ---
    res.status(200).json({email, role: user.role, settings: user.settings, token}); 
  } catch (error) {
    res.status(400).json({error: error.message});
  }
}

// --- 🟢 NEW: Update User Settings ---
const updateSettings = async (req, res) => {
  // We extract the settings from the frontend request
  const { tempUnit, alertsEnabled, hapticsEnabled } = req.body;

  try {
    // req.user._id will be provided by your auth middleware
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        $set: { 
          "settings.tempUnit": tempUnit,
          "settings.alertsEnabled": alertsEnabled,
          "settings.hapticsEnabled": hapticsEnabled
        } 
      },
      { new: true } // This tells Mongoose to return the updated document
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: "Settings saved!", settings: user.settings });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// --- 🟢 NEW: Change Password ---
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // req.user._id comes from your requireAuth middleware
    await User.changePassword(req.user._id, currentPassword, newPassword);
    
    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


module.exports = { signupUser, loginUser, updateSettings, changePassword };