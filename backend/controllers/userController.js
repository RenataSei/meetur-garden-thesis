const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const createToken = (_id) => {
  return jwt.sign({_id}, process.env.SECRET, { expiresIn: '3d' });
}

// login user
const loginUser = async (req, res) => {
  // 🟢 NEW: Extract twoFactorToken from the request body
  const {email, password, twoFactorToken} = req.body;

  try {
    const user = await User.login(email, password);

    // 🟢 NEW: 2FA ENFORCEMENT LOGIC
    if (user.twoFactorEnabled) {
      // Step 1: Password is correct, but they haven't sent a 2FA code yet.
      if (!twoFactorToken) {
        // Send a 200 OK without the JWT token to tell the frontend we need the 2FA code.
        return res.status(200).json({ requires2FA: true, email: user.email });
      }

      const cleanToken = String(twoFactorToken).replace(/\s/g, '').trim();

      // Step 2: They sent a 2FA code. Let's verify it!
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: cleanToken,
        window: 1 // Allows a 30-second grace period
      });

      if (!verified) {
        return res.status(400).json({ error: "Invalid 2FA code. Please try again." });
      }
    }

    // If we reach here, either 2FA is OFF, or 2FA is ON and the code was CORRECT!
    const token = createToken(user._id);

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

// 1. GENERATE THE QR CODE (Called when user clicks "Enable 2FA" in settings)
const generate2FA = async (req, res) => {
  try {
    // We need the user's ID from the auth middleware
    const user = await User.findById(req.user._id);

    // Generate a secure secret specific to this user
    const secret = speakeasy.generateSecret({
      name: `Meet-Ur Garden (${user.email})` // This is what shows up in Google Authenticator
    });

    // Save the secret temporarily (we won't enable 2FA until they prove they scanned it)
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate the visual QR Code URL
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({ qrCodeUrl, secret: secret.base32 });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate 2FA secret" });
  }
};

// 2. VERIFY AND ENABLE (Called when user types in the 6-digit code to confirm setup)
const verifyAndEnable2FA = async (req, res) => {
  const { token } = req.body; // The 6-digit code from their phone

  const cleanToken = String(token).replace(/\s/g, '').trim();

  try {
    const user = await User.findById(req.user._id);

    // Check if the code they typed matches their secret
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: cleanToken,
      window: 1 // Allows a 30-second grace period in case they are slow typing
    });

    if (verified) {
      // It worked! Officially enable 2FA for this user
      user.twoFactorEnabled = true;
      await user.save();
      res.status(200).json({ message: "2FA successfully enabled!" });
    } else {
      res.status(400).json({ error: "Invalid token. Try again." });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error during verification" });
  }
};


module.exports = { signupUser, loginUser, updateSettings, changePassword, generate2FA, verifyAndEnable2FA };