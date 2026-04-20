const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const crypto = require("crypto"); // For generating secure random tokens
const nodemailer = require("nodemailer"); // For sending emails

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

// login user
const loginUser = async (req, res) => {
  // 🟢 NEW: Extract twoFactorToken from the request body
  const { email, password, twoFactorToken } = req.body;

  try {
    const user = await User.login(email, password);

    // 🟢 NEW: 2FA ENFORCEMENT LOGIC
    if (user.twoFactorEnabled) {
      // Step 1: Password is correct, but they haven't sent a 2FA code yet.
      if (!twoFactorToken) {
        // Send a 200 OK without the JWT token to tell the frontend we need the 2FA code.
        return res.status(200).json({ requires2FA: true, email: user.email });
      }

      const cleanToken = String(twoFactorToken).replace(/\s/g, "").trim();

      // Step 2: They sent a 2FA code. Let's verify it!
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: cleanToken,
        window: 1, // Allows a 30-second grace period
      });

      if (!verified) {
        return res
          .status(400)
          .json({ error: "Invalid 2FA code. Please try again." });
      }
    }

    // If we reach here, either 2FA is OFF, or 2FA is ON and the code was CORRECT!
    const token = createToken(user._id);

    res
      .status(200)
      .json({
        email,
        role: user.role,
        settings: user.settings,
        nickname: user.nickname,
        birthday: user.birthday,
        token,
      });
  } catch (error) {
    
    res.status(400).json({ error: error.message });
  }
};

// signup user
const signupUser = async (req, res) => {
  // 🟢 NEW: Extract the new fields from the request body
  const { name, businessName, accountType, email, password, role } = req.body;

  try {
    // 🟢 NEW: Pass all fields to the model in the correct order
    const user = await User.signup(name, businessName, accountType, email, password, role);
    const token = createToken(user._id);

    // Send the data back to the frontend
    res
      .status(200)
      .json({
        name: user.name,
        businessName: user.businessName,
        accountType: user.accountType,
        email,
        role: user.role,
        settings: user.settings,
        nickname: user.nickname,
        birthday: user.birthday,
        token,
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// --- Update User Settings ---
const updateSettings = async (req, res) => {
  const { alertsEnabled, hapticsEnabled, customLocation, nickname, birthday } = req.body;

  try {
    // 1. Build the update object dynamically so we only update what exists
    const updateFields = {
      nickname: nickname || "",
    };

    // 2. Safely handle the birthday (Only set it if it's a valid date string or null)
    if (birthday) {
      updateFields.birthday = new Date(birthday);
    } else {
      updateFields.birthday = null;
    }

    // 3. Safely handle nested settings
    if (alertsEnabled !== undefined) updateFields["settings.alertsEnabled"] = alertsEnabled;
    if (hapticsEnabled !== undefined) updateFields["settings.hapticsEnabled"] = hapticsEnabled;
    if (customLocation !== undefined) updateFields["settings.customLocation"] = customLocation;

    // 4. Send to database
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true } 
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ 
      message: "Settings saved!", 
      settings: user.settings,
      nickname: user.nickname,
      birthday: user.birthday
    });
  } catch (error) {
    console.log("SETTINGS UPDATE ERROR:", error); // <-- This will print the exact issue in Render/Terminal
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
};

// 1. GENERATE THE QR CODE (Called when user clicks "Enable 2FA" in settings)
const generate2FA = async (req, res) => {
  try {
    // We need the user's ID from the auth middleware
    const user = await User.findById(req.user._id);

    // Generate a secure secret specific to this user
    const secret = speakeasy.generateSecret({
      name: `Meet-Ur Garden (${user.email})`, // This is what shows up in Google Authenticator
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

  const cleanToken = String(token).replace(/\s/g, "").trim();

  try {
    const user = await User.findById(req.user._id);

    // Check if the code they typed matches their secret
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: cleanToken,
      window: 1, // Allows a 30-second grace period in case they are slow typing
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

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    
    // We return a generic message even if the user isn't found. 
    // This prevents hackers from using this form to guess which emails are registered.
    if (!user) {
      return res.status(200).json({ message: "If an account with that email exists, a reset link has been sent." });
    }

    // 1. Generate a random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 2. Save the token and an expiration date (e.g., 1 hour from now) to the user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour in milliseconds
    await user.save();

    // 3. Set up Nodemailer to send the email
    // NOTE: You will need to add EMAIL_USER and EMAIL_PASS to your .env file
    const transporter = nodemailer.createTransport({
      service: "Gmail", // You can use Gmail, SendGrid, Outlook, etc.
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    // Determine the frontend URL (Localhost for dev, real URL for production)
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendURL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"Meet-Ur Garden" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Please click the following link to choose a new password: \n\n ${resetLink} \n\n If you did not request this, please ignore this email.`,
      html: `<p>You requested a password reset. Please click the button below to choose a new password:</p>
             <a href="${resetLink}" style="background-color: #38bdf8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
             <p>This link will expire in 1 hour.</p>
             <p>If you did not request this, please ignore this email.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "If an account with that email exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ error: "An error occurred while sending the email." });
  }
};

// Reset Password Controller
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // 1. Find the user with this token, ensuring it hasn't expired yet
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // $gt means "greater than" current time
    });

    if (!user) {
      return res.status(400).json({ error: "Password reset token is invalid or has expired." });
    }

    // 2. Hash the new password
    const bcrypt = require("bcrypt");
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // 3. Update the user's password and clear the reset fields
    user.password = hash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password successfully updated." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: "An error occurred while resetting the password." });
  }
};

// 🟢 NEW: Get all users for Admin Dashboard
const getAllUsers = async (req, res) => {
  // Security Check: Only Admins can see this data
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  try {
    // Fetch all users, excluding their hashed passwords for security
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Make sure to export the new functions at the bottom!
module.exports = {
  signupUser,
  loginUser,
  updateSettings,
  changePassword,
  generate2FA,
  verifyAndEnable2FA,
  forgotPassword, // Added
  resetPassword,  // Added
  getAllUsers,
};