const jwt = require("jsonwebtoken");

const handleJWT = async (req, res, next) => {
  const authHeader = req.headers.Authorization || req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong, Incomplete header",
    });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({
        success: false,
        message: `Something went wrong ${err}. Token doesn't match `,
      });
    req.username = decoded.userInfo.username;
    req.roles = decoded.userInfo.roles;
    next();
  });
};

module.exports = handleJWT;
