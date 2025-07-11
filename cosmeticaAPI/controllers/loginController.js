const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/emailService");

const handleLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required." });
  }

  try {
    // 2. Check if user exists (using email address because it is unique).
    // Using .select('+password') if password is set to select: false in schema
    const foundUser = await User.findOne({ email: email }).select("+password");

    if (!foundUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials (email or password incorrect).",
      });
    }

    const match = await bcrypt.compare(password, foundUser.password);

    if (match) {
      const roles = Object.values(foundUser.roles || {});

      // 5. Generate Access Token
      const accessToken = jwt.sign(
        { userInfo: { username: foundUser.username, roles: roles } },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "300s" } // 5 minutes
      );

      const refreshToken = jwt.sign(
        { userInfo: { username: foundUser.username } },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" } // 1 day
      );

      foundUser.refreshToken = refreshToken;
      await foundUser.save();

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      // 9. Send success response
      res.status(200).json({
        success: true,
        message: `${foundUser.username} is successfully logged in.`, // Use foundUser.username
        data: {
          accessToken: accessToken,
          userInfo: { username: foundUser.username, roles: roles },
        },
      });

      const loginSubject = "Security Alert: New Login Detected!";
      const loginHtmlContent = `
        <p>Hello ${foundUser.username},</p>
        <p>This is a security alert to inform you that your account just logged in.</p>
        <p>If this was not you, please secure your account immediately.</p>
        <p>Login Time: ${new Date().toLocaleString()}</p>
        <p>Best regards,</p>
        <p>The SK-stitch Security Team</p>
      `;

      sendEmail(foundUser.email, loginSubject, loginHtmlContent).catch(
        (emailError) =>
          console.error(`Failed to send login notification email${emailError}`)
      );
    } else {
      // 10. Handle password mismatch (invalid credentials)
      return res.status(401).json({
        // 401 Unauthorized
        success: false,
        message: "Invalid credentials (email or password incorrect).",
      });
    }
  } catch (error) {
    // 11. General error handling for any unexpected issues
    console.error("Error during login:", error); // Log the actual error for debugging

    // Handle other types of errors (e.g., database connection issues, JWT errors)
    // Avoid sending internal error details to the client in production
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred during login.",
      // details: error.message, // Consider removing `details` in production
    });
  }
};

module.exports = handleLogin;
