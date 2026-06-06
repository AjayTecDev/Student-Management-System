const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'sms_super_secret_jwt_key_2024';

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const principalOnly = (req, res, next) => {
  if (req.user?.role !== 'principal') {
    return res.status(403).json({ error: 'Principal access required' });
  }
  next();
};

module.exports = { authMiddleware, principalOnly };
