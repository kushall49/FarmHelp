const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET || JWT_SECRET === 'REPLACE_ME') {
    return res.status(500).json({ success: false, error: 'JWT_SECRET not configured' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[AUTH] Token decoded successfully:', JSON.stringify(decoded, null, 2));
    console.log('[AUTH] Has id field:', !!decoded.id);
    console.log('[AUTH] Has userId field:', !!decoded.userId);
    req.user = decoded; // { id, userId, email, ... }
    next();
  } catch (error) {
    console.error('[AUTH] Token verification failed:', error.message);
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

module.exports = authMiddleware;
