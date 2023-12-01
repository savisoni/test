const authMiddleware = (req, res, next) => {
    if (req.cookies.jwt) {
      req.isAuthenticated = true;
    } else {
      req.isAuthenticated = false;
    }
    next();
  };
  
  module.exports = authMiddleware;