const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    // 🟢 NEW: Name and Business Name
    name: {
      type: String,
      required: true,
    },
    businessName: {
      type: String,
      default: "", // Optional
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    // Profile Fields
    nickname: { type: String, default: "" },
    birthday: { type: Date, default: null },

    settings: {
      alertsEnabled: { type: Boolean, default: true },
      hapticsEnabled: { type: Boolean, default: true },
      customLocation: { type: String, default: "" },
    },

    // 🟢 NEW: Account Type (Client vs Free User)
    accountType: {
      type: String,
      enum: ["Free User", "Client"],
      default: "Free User",
    },

    // --- Role Field (System Level Access) ---
    role: {
      type: String,
      enum: ["user", "admin"], 
      default: "user", 
    },

    // --- 2FA Fields ---
    twoFactorSecret: {
      type: String,
      default: null,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    // Password Reset Fields
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// 🟢 UPDATED: Static signup method now accepts name, businessName, and accountType
userSchema.statics.signup = async function (name, businessName, accountType, email, password, role) {
  // Require name, email, and password
  if (!name || !email || !password) {
    throw new Error("Name, email, and password must be filled");
  }
  if (!validator.isEmail(email)) {
    throw new Error("Email is not valid");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error("Password not strong enough. Ensure it has a mix of uppercase, lowercase, numbers, and symbols.");
  }

  const exists = await this.findOne({ email });
  if (exists) {
    throw new Error("Email already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  // Save the user with the new fields
  const user = await this.create({ 
    name, 
    businessName: businessName || "", 
    accountType: accountType || "Free User", 
    email, 
    password: hash, 
    role: role || "user" 
  });

  return user;
};

// Static login method (unchanged)
userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw new Error("All fields must be filled");
  }

  const user = await this.findOne({ email });
  if (!user) {
    throw new Error("Incorrect email");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error("Incorrect password");
  }

  return user;
};

// Static change password method (unchanged)
userSchema.statics.changePassword = async function (
  _id,
  currentPassword,
  newPassword,
) {
  if (!currentPassword || !newPassword) {
    throw new Error("Both current and new passwords must be filled");
  }
  if (!validator.isStrongPassword(newPassword)) {
    throw new Error("New password is not strong enough");
  }

  const user = await this.findById(_id);
  if (!user) {
    throw new Error("User not found");
  }

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    throw new Error("Incorrect current password");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);

  user.password = hash;
  await user.save();

  return user;
};

module.exports = mongoose.model("User", userSchema);