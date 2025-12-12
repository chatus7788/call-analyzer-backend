import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * JWT Authentication Middleware
 * OWASP Principles Applied:
 * - Validates JWT tokens from Authorization header
 * - Uses Bearer token scheme
 * - Verifies token signature with secret key
 * - Checks token expiration
 * - Attaches minimal user info to request
 * - Returns appropriate HTTP status codes
 * - No sensitive data exposure in error messages
 */

const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and follows Bearer scheme
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.'
      });
    }

    // Extract the token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    // Verify token is not empty
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.'
      });
    }

    // Verify JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET is not configured in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error. Please contact support.'
      });
    }

    // Verify and decode the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      // Handle specific JWT errors
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please log in again.'
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Please log in again.'
        });
      }
      // Generic error for other JWT issues
      console.error('JWT verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Please log in again.'
      });
    }

    // Verify user still exists in database
    // This prevents use of tokens for deleted users
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists. Please log in again.'
      });
    }

    // Attach user information to request object
    // OWASP: Only attach necessary user data, not sensitive info
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      plan: user.plan,
      name: user.name
    };

    // Proceed to next middleware/route handler
    next();
  } catch (error) {
    // Log detailed error server-side only
    console.error('Authentication middleware error:', error);
    
    // Return generic error to client (don't expose stack traces)
    return res.status(500).json({
      success: false,
      message: 'An error occurred during authentication. Please try again.'
    });
  }
};

/**
 * Optional middleware to check user plan
 * Use this after authMiddleware to restrict routes to specific plans
 */
export const requirePlan = (requiredPlan) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (req.user.plan !== requiredPlan) {
      return res.status(403).json({
        success: false,
        message: `This feature requires a ${requiredPlan} plan.`
      });
    }

    next();
  };
};

export default authMiddleware;
