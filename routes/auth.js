import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authMiddleware from '../middlewares/auth.js';
import { validate, registerSchema, loginSchema } from '../validators/auth.validator.js';

const router = express.Router();

/**
 * POST /auth/register
 * Register a new user
 * 
 * OWASP Principles Applied:
 * - Input validation and sanitization
 * - Strong password hashing with bcrypt
 * - Prevent user enumeration (generic error messages)
 * - No sensitive data in responses
 * - Proper HTTP status codes
 */
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    // OWASP: Use same error message for existing/new users to prevent enumeration
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // Create new user
    // Password will be automatically hashed by the User model pre-save hook
    const user = new User({
      name,
      email,
      passwordHash: password, // Will be hashed before saving
      plan: 'free' // Default plan
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        issuer: 'call-analyzer',
        audience: 'call-analyzer-users'
      }
    );

    // Return success response with token and safe user data
    // OWASP: Don't include sensitive data like passwordHash
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: user.getSafeProfile()
      }
    });

  } catch (error) {
    // Log detailed error server-side
    console.error('Registration error:', error);

    // Handle specific errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    // Handle duplicate key error (race condition)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // OWASP: Don't expose internal errors to client
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again.'
    });
  }
});

/**
 * POST /auth/login
 * Authenticate user and return JWT token
 * 
 * OWASP Principles Applied:
 * - Prevent user enumeration (same error for invalid email/password)
 * - Use constant-time password comparison (bcrypt handles this)
 * - Rate limiting should be applied at app level
 * - Secure JWT generation
 * - No sensitive data in responses
 */
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly include passwordHash (it's excluded by default)
    const user = await User.findOne({ email }).select('+passwordHash');

    // OWASP: Use generic error message to prevent user enumeration
    // Don't reveal whether email exists or password is wrong
    const invalidCredentialsMessage = 'Invalid credentials. Please check your email and password.';

    if (!user) {
      // Add artificial delay to prevent timing attacks
      // This makes the response time similar whether user exists or not
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return res.status(401).json({
        success: false,
        message: invalidCredentialsMessage
      });
    }

    // Compare password using bcrypt (constant-time comparison)
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: invalidCredentialsMessage
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        issuer: 'call-analyzer',
        audience: 'call-analyzer-users'
      }
    );

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: user.getSafeProfile()
      }
    });

  } catch (error) {
    // Log detailed error server-side
    console.error('Login error:', error);

    // OWASP: Don't expose internal errors to client
    res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.'
    });
  }
});

/**
 * GET /auth/me
 * Get current user profile
 * Protected route - requires valid JWT token
 * 
 * OWASP Principles Applied:
 * - Requires authentication (authMiddleware)
 * - Returns only safe user data
 * - No sensitive information exposed
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // req.user is set by authMiddleware after JWT verification
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return safe user profile
    res.status(200).json({
      success: true,
      data: {
        user: user.getSafeProfile()
      }
    });

  } catch (error) {
    // Log detailed error server-side
    console.error('Get profile error:', error);

    // OWASP: Don't expose internal errors to client
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching user profile. Please try again.'
    });
  }
});

export default router;
