const jwt = require('jsonwebtoken');

// Wahi same secret key jo controller mein thi
const JWT_SECRET = process.env.JWT_SECRET || 'ethara_super_secret_key_2026';

exports.protect = (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; 
  }

  if (!token) {
    return res.status(401).json({ message: 'Access Denied! Koi token nahi mila.' });
  }

  try {
    // FIX: Yahan JWT_SECRET use kiya taaki dono match ho jayein
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    next(); 
  } catch (error) {
    res.status(401).json({ message: 'Token invalid ya expire ho chuka hai.' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role (${req.user.role}) ko ye action karne ki permission nahi hai.` 
      });
    }
    next(); 
  };
};