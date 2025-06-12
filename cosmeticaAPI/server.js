// import dependencies
require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const corsOption = require("./config/corsOption");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConnection");
const app = express();
const PORT = process.env.PORT || 3500;

// middlewares
const handleJWT = require("./middlewares/verifyJWT");

// Import  routes
const productsRoute = require("./routes/products");
const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
const refreshToken = require("./routes/refresh");

// connect DB
connectDB();

// middleware for cors
app.use(cors(corsOption));

// Middleware for parsing cookies
app.use(cookieParser());

// middleware for parsing json files
app.use(express.json());

// serve static files
app.use("/", express.static(path.join(__dirname, "/public")));

// use routes
app.use("/register", registerRoute);
app.use("/login", loginRoute);
app.use("/refresh", refreshToken);

// middleware for our custom JWT
app.use(handleJWT);
app.use("/products", productsRoute);

// Server errors
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send("Something broke!");
});

// Make our app listen to PORT only when connected to DB
mongoose.connection.once("open", () => {
  console.log("Successfully connected to DB");
  app.listen(PORT, () => console.log(`server started on ${PORT}`));
});
