const verifyUserRoles = (...allowedRoles) => {
  return (req, res, next) => {
    let userRoles = [];
    if (req.user && Array.isArray(req.user.roles)) {
      userRoles = req.user.roles;
    } else if (Array.isArray(req.roles)) {
      userRoles = req.roles;
    }

    if (userRoles.length === 0) {
      return res.status(403).json({
        message: "Access Denied: User roles not found or not authenticated.",
      });
    }

    const availableRoles = [...allowedRoles];
    const hasPermission = userRoles.some((role) =>
      availableRoles.includes(role)
    );

    if (!hasPermission) {
      return res.status(403).json({
        message: "Access Denied: You do not have the required permissions.",
      });
    }

    next();
  };
};

module.exports = verifyUserRoles;
