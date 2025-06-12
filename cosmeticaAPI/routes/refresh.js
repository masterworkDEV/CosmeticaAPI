const express = require("express");
const router = express.Router();
const refreshTokenController = require("../controllers/refreshTokenController"); //handler

router.route("/").post(refreshTokenController);

module.exports = router;
