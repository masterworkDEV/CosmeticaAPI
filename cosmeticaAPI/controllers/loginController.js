//

const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const handleLogin = async (req, res) => {
  const { email, password } = req.body; // Destructure email and password

  // 1. Initial input validation
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required." }); // Corrected message and typo
  }

  try {
    // 2. Check if user exists (using email address because it is unique).
    // Using .select('+password') if password is set to select: false in schema
    const foundUser = await User.findOne({ email: email }).select("+password");

    // 3. When we can't find a user (or password doesn't match later)
    if (!foundUser) {
      // Use 401 Unauthorized to avoid giving away if user exists or not
      return res.status(401).json({
        success: false,
        message: "Invalid credentials (email or password incorrect).",
      });
    }

    // 4. Verify password if it matches with our hashed password.
    // CORRECTED: Plain-text password first, then the hashed password
    const match = await bcrypt.compare(password, foundUser.password);

    if (match) {
      const roles = Object.values(foundUser.roles || {});

      // 5. Generate Access Token
      const accessToken = jwt.sign(
        { userInfo: { username: foundUser.username, roles: roles } },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "300s" } // 5 minutes
      );

      // 6. Generate new refresh token (simplified payload - no roles)
      const refreshToken = jwt.sign(
        { userInfo: { username: foundUser.username } },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" } // 1 day
      );

      // 7. Save new refresh token to the user in the database
      foundUser.refreshToken = refreshToken;
      // It's good practice to save only the necessary fields if you're concerned about performance
      // For example: await User.updateOne({ _id: foundUser._id }, { refreshToken: refreshToken });
      await foundUser.save(); // This will save the whole document

      // 8. Set new refresh token in httpOnly cookie
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true, // Should be true in production (HTTPS)
        sameSite: "None", // Required for cross-site cookies, implicitly requires secure: true
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
