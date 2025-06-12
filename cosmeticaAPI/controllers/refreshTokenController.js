const jwt = require("jsonwebtoken");
const User = require("../model/User");

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(401);
  }
  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken: refreshToken });
  if (!foundUser) {
    return res.sendStatus(403);
  }
  const roles = Object.values(foundUser.roles || {});
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (error, decoded) => {
      if (error) return res.sendStatus(401);
      if (foundUser.username !== decoded.userInfo.username) {
        console.warn(`Username mismatched: ${foundUser.username}`);
        return res.sendStatus(403);
      }

      //   new access token
      const accessToken = jwt.sign(
        { userInfo: { username: foundUser.username, roles: roles } },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "300s" }
      );

      //   generate new refresh token too so once issued a new access token, the previous refresh token expires immediately
      const newRefreshToken = jwt.sign(
        { userInfo: { username: foundUser.username } },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      //   set and save new refresh token
      foundUser.refreshToken = newRefreshToken;
      await foundUser.save();

      //   save new refresh token in cookie
      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "New token generated",
        data: accessToken,
      });
    }
  );
};

module.exports = handleRefreshToken;
