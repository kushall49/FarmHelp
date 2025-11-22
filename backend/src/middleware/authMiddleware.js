const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization required.'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Add user info to request
      req.user = {
        id: decoded.id || decoded.userId,  // ✅ FIX: Controller expects 'id'
        userId: decoded.userId || decoded.id,  // Keep userId for backward compatibility
        email: decoded.email
      };

      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in authentication',
      error: error.message
    });
  }
};

module.exports = { authMiddleware };
