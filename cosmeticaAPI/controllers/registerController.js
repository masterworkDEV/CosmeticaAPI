const User = require("../model/User");

const handleNewUser = async (req, res) => {
  const { username, email } = req.body;

  //    check for existing email and password. mongoose does the firstname and other checks in the background.
  const existingUser = await User.findOne({ username: username });
  if (existingUser)
    res
      .status(409)
      .json({ success: false, message: "This username already exist" }); //conflict

  const existingEmail = await User.findOne({ email: email });
  if (existingEmail)
    return res
      .status(409)
      .json({ success: false, message: "This email already  exist" }); //conflict

  try {
    const newUser = await User.create(req.body);
    res.status(201).json({
      success: true,
      message: `New user ${username} created`,
      data: newUser,
    });
  } catch (error) {
    console.error("Error creating new user", error);
    // Handle Mongoose validation errors specifically
    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    // Handle other types of errors
    res.status(500).json({
      success: false,
      message: "Failed to create user due to server error",
      details: error.message,
    });
  }
};

module.exports = handleNewUser;
