require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const sendEmail = require("../utils/emailService");

// create instance
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
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
        default: 2001,
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

    isActive: {
      type: Boolean,
      default: false,
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

userSchema.post("save", async function (doc, next) {
  if (!this.isNew) {
    return next();
  }

  const authorisedEmail = process.env.GMAIL_EMAIL;
  const authorisedPassword = process.env.GMAIL_PASSWORD;

  if (!authorisedEmail || !authorisedPassword) {
    console.error(
      "Nodemailer credentials are not set. Email notification skipped."
    );
    return next(); // Continue without sending email
  }

  // set registeration message

  const userEmail = doc.email;
  const username = doc.username;
  const subject = `Welcome To SK-stitch Collections And Wears `;
  const htmlContent = `
      <p>Hello ${username},</p>
      <p>Your account has been successfully created on our platform.</p>
      <p>Thank you for joining us!</p>
      <p>Best regards,</p>
      <p>The SK-stitch Team</p>
`;

  sendEmail(userEmail, subject, htmlContent)
    .catch((error) =>
      console.error(`Failed to send registeration email ${error}`)
    )
    .finally(() => next());
});

const user = mongoose.model("User", userSchema);
module.exports = user;
