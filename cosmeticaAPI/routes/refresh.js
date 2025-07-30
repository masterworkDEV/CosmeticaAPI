const express = require("express");
const handleRefreshToken = require("../controllers/refreshTokenController");
const router = express.Router();

//handler

router.route("/").get(handleRefreshToken);

module.exports = router;
