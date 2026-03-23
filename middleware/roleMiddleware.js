const allowUser = (req, res, next) => {
  if (req.user.role !== 'user' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. User role required.' });
  }
  next();
};

const allowProvider = (req, res, next) => {
  if (req.user.role !== 'provider' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Provider role required.' });
  }
  next();
};

const allowAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

module.exports = {
  allowUser,
  allowProvider,
  allowAdmin
};
