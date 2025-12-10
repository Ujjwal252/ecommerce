module.exports = (req, res, next) => {
  // auth middleware ne already req.user set kar diya hoga
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  next();
};
