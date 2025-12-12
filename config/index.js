/**
 * Application Configuration
 * Centralized configuration management
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development'
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/call-analyzer',
    options: {
      // Mongoose options can be added here if needed
    }
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    issuer: 'call-analyzer',
    audience: 'call-analyzer-users'
  },

  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    rateLimitWindow: 15 * 60 * 1000, // 15 minutes
    rateLimitMaxRequests: 100,
    authRateLimitMaxRequests: 5
  },

  // Redis Configuration (for BullMQ)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  },

  // AWS S3 Configuration
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3BucketName: process.env.S3_BUCKET_NAME
  },

  // AssemblyAI Configuration
  assemblyai: {
    apiKey: process.env.ASSEMBLYAI_API_KEY
  }
};

/**
 * Validate required environment variables
 */
export const validateConfig = () => {
  const required = [
    { key: 'JWT_SECRET', value: config.jwt.secret },
    { key: 'MONGODB_URI', value: config.database.uri }
  ];

  const missing = required.filter(item => !item.value);

  if (missing.length > 0) {
    const missingKeys = missing.map(item => item.key).join(', ');
    throw new Error(`Missing required environment variables: ${missingKeys}`);
  }

  // Warn about weak JWT secret
  if (config.jwt.secret && config.jwt.secret.length < 32) {
    console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters long for security');
  }
};

export default config;
