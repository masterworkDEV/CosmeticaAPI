const verifyUserRoles = (...userRoles) => {
  return (req, res, next) => {
    const { roles } = req.roles;
    if (!roles) return res.sendstatus(403); // Forbidden
    const validateUserRoles = [...userRoles];
    const result = roles
      .map((role) => validateUserRoles.includes(role))
      .find((val) => val === true);
    if (!result) return res.sendStatus(401);
    next();
  };
};

module.exports = verifyUserRoles;
