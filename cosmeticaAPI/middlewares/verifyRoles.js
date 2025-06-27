const verifyUserRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({
        message: "Access Denied: User roles not found or not authenticated.",
      });
    }
    const { roles } = req.user;

    const availableRoles = [...allowedRoles];
    const hasPermission = roles.some((role) => availableRoles.includes(role));
    if (!hasPermission) {
      return res.status(403).json({
        message: "Access Denied: You do not have the required permissions.",
      });
    }

    next();
  };
};

module.exports = verifyUserRoles;
