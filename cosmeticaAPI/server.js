// import dependencies
require("dotenv").config(); // Load environment variables first
const path = require("path");
const express = require("express");
const cors = require("cors");
const corsOption = require("./config/corsOption"); // Assuming this correctly configures credentials and origin
const cookieParser = require("cookie-parser"); // Middleware to parse cookies

const mongoose = require("mongoose");
const connectDB = require("./config/dbConnection");
const app = express();
const PORT = process.env.PORT || 3500;

// Import routes
const productsRoute = require("./routes/products");
const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");

// use only for our refresh token, checking if it would work here
const User = require("./model/User");
const jwt = require("jsonwebtoken");

// Connect to MongoDB
connectDB();

// --- Core Middlewares ---

// Middleware for parsing cookies - Crucial for req.cookies to work, must be before routes that access cookies
app.use(cookieParser());

// Middleware for CORS - Must be before routes that use CORS
app.use(cors(corsOption));

// Middleware for parsing JSON request bodies
app.use(express.json());

// Serve static files (e.g., frontend build if serving from backend)
app.use("/", express.static(path.join(__dirname, "/public")));

// --- Routes ---

// Authentication/Authorization routes
app.use("/register", registerRoute);
app.use("/login", loginRoute);
// refresh route
app.get("/refresh", async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) {
    return res.sendStatus(401);
  }
  const refreshToken = cookies.jwt;
  try {
    const foundUser = await User.findOne({ refreshToken: refreshToken });
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (error, decoded) => {
        if (error) {
          return res
            .status(401)
            .json({ message: `Error something went wrong ${error.message}` });
        }
        if (foundUser.username !== decoded.userInfo.username) {
          console.log(decoded.userInfo);
          return res
            .status(403)
            .json({ success: false, message: `Error: username mismatched` });
        }
      }
    );

    const newAccessToken = jwt.sign(
      {
        userInfo: {
          username: foundUser.username,
          roles: Object.values(foundUser.roles),
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "300s",
      }
    );

    const newRefreshToken = jwt.sign(
      {
        userInfo: {
          username: foundUser.username,
          roles: Object.values(foundUser.roles),
        },
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
    foundUser.refreshToken = newRefreshToken;
    await foundUser.save();

    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.send(newAccessToken); // send new accessToken
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error, cannot refresh at this time: ${error}`,
    });
  }
});

// Other API routes
app.use("/products", productsRoute);

// --- Error Handling ---
// Global error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Use console.error for errors
  res.status(500).send("Something broke!");
});

// Make our app listen to PORT only when connected to DB
mongoose.connection.once("open", () => {
  console.log("Successfully connected to DB");
  app.listen(PORT, () => console.log(`Server started on ${PORT}`));
});
