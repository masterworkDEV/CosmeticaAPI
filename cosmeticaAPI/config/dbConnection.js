const mongoose = require("mongoose");
const username = process.env.MONGODB_USERNAME;
const password = encodeURIComponent(process.env.MONGODB_PASSWORD);
const mongodbURI = `mongodb+srv://${username}:${password}@cluster0.bcvx943.mongodb.net/`;

const connectDB = async () => {
  try {
    await mongoose.connect(mongodbURI);
  } catch (error) {
    console.error("mongoDB error:", error.message);
  }
};

module.exports = connectDB;
