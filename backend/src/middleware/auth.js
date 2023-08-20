/**
 * This file contains all of the auth middleware, including
 * single and multi-role authorization
 */

const jwt = require("jsonwebtoken");
const fetchJWTSecret = require("../config/aws");

const authenticateAndAuthorize = async (requiredRoles) => {
  secretKey = await fetchJWTSecret();

  return (req, res, next) => {
    const token =
      req.headers.authorization && req.header.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const decodedToken = jwt.verify(token, secretKey);
      const hasRequiredRole = requiredRoles.some((role) =>
        decodedToken.roles.includes(role)
      );
      if (!hasRequiredRole) {
        return res.status(403).json({ message: "Forbidden" });
      }
      req.user = decodedToken;
      next();
    } catch {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
};

module.exports = {
  studentMiddleware: authenticateAndAuthorize(["student"]),
  adminMiddleware: authenticateAndAuthorize(["admin"]),
  studentAdminMiddleware: authenticateAndAuthorize(["admin", "student"]),
};
