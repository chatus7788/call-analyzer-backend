import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import {transcript} from "./routes/transcription.routes.js"


/**
 * Call Analyzer Application
 * Main Express application with security best practices
 * 
 * OWASP Security Principles Applied:
 * - Helmet for security headers
 * - Rate limiting to prevent brute force attacks
 * - Input validation on all routes
 * - Secure error handling (no stack traces in production)
 * - Environment-based configuration
 * - HTTPS assumed (terminated at reverse proxy/load balancer)
 */

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ======================
// Security Middleware
// ======================

/**
 * Helmet - Sets various HTTP headers for security
 * OWASP: Protect against common web vulnerabilities
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));

/**
 * Rate Limiting
 * OWASP: Prevent brute force attacks and DoS
 * Apply different limits for different endpoints
 */

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/register attempts per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiter to all routes
app.use(generalLimiter);

// Apply stricter rate limiter to auth routes
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

// ======================
// Body Parsing Middleware
// ======================

/**
 * Parse JSON bodies
 * OWASP: Limit body size to prevent DoS attacks
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ======================
// Request Logging (Development)
// ======================

if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ======================
// Health Check Endpoint
// ======================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ======================
// API Routes
// ======================

app.use('/auth', authRoutes);
app.use('/api', transcript);


// ======================
// 404 Handler
// ======================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ======================
// Global Error Handler
// ======================

/**
 * OWASP: Never expose stack traces or internal errors in production
 * Log detailed errors server-side only
 */
app.use((err, req, res, next) => {
  // Log error details server-side
  console.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Response object
  const response = {
    success: false,
    message: NODE_ENV === 'production' 
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'Internal server error'
  };

  // Include stack trace only in development
  if (NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

// ======================
// Database Connection
// ======================

/**
 * Connect to MongoDB
 * OWASP: Use environment variables for connection string
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      // These options are now default in Mongoose 6+, but included for clarity
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1); // Exit process with failure
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nGracefully shutting down...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

// ======================
// Start Server
// ======================

const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${NODE_ENV}`);
      console.log(`🔒 Security features enabled: Helmet, Rate Limiting`);
      console.log(`\nAvailable routes:`);
      console.log(`  POST   /auth/register - Register new user`);
      console.log(`  POST   /auth/login    - Login user`);
      console.log(`  GET    /auth/me       - Get current user profile (protected)`);
      console.log(`  GET    /health        - Health check`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();

export default app;
