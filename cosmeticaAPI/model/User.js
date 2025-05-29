const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required."],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters long."],
      maxlength: [30, "Username cannot exceed 30 characters."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/,
        "Please enter a valid email address.",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters long."],
      select: false,
    },

    roles: {
      User: {
        type: Number,
        default: 2001, // Common default for a regular user
      },
      Editor: Number,
      Admin: Number,
    },

    refreshToken: {
      type: String,
    },

    firstName: {
      type: String,
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters."],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters."],
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?\d{10,15}$/, "Please enter a valid phone number."],
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    // Account Status
    isActive: {
      // For enabling/disabling user accounts (e.g., after email verification)
      type: Boolean,
      default: false, // Users might need to verify email to become active
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

const user = mongoose.model("User", userSchema);
module.exports = user;
