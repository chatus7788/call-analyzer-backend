# OWASP Security Implementation Guide

This document details how OWASP (Open Web Application Security Project) security principles have been implemented in the Call Analyzer authentication system.

## 🛡️ OWASP Top 10 Coverage

### 1. Broken Access Control

**Implementation:**
- JWT-based authentication middleware (`middlewares/auth.js`)
- Token verification on protected routes
- User role/plan checking with `requirePlan()` middleware
- Proper HTTP status codes (401 for unauthorized, 403 for forbidden)

**Code Example:**
```javascript
// Protected route
router.get('/auth/me', authMiddleware, async (req, res) => {
  // Only authenticated users can access
});

// Plan-specific route
router.get('/premium-feature', authMiddleware, requirePlan('pro'), async (req, res) => {
  // Only pro users can access
});
```

---

### 2. Cryptographic Failures

**Implementation:**
- **Never** store plain passwords
- Bcrypt hashing with configurable salt rounds (default: 12)
- JWT secret stored in environment variables
- Strong JWT secret validation (minimum 32 characters warning)
- Password hash excluded from queries by default

**Code Example:**
```javascript
// User model with automatic password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
  next();
});

// Password comparison with constant-time comparison
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};
```

---

### 3. Injection

**Implementation:**
- Joi schema validation on all inputs
- Input sanitization (strip HTML tags, trim whitespace)
- MongoDB injection prevention via Mongoose schema validation
- Email normalization (lowercase, trim)
- Name validation with regex patterns

**Code Example:**
```javascript
// Joi validation schema
const registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s'-]+$/)
    .required(),
  email: emailSchema,
  password: passwordSchema
});

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true // Remove unknown fields
    });
    // ...
  };
};
```

---

### 4. Insecure Design

**Implementation:**
- Strong password policy enforcement
- Rate limiting on authentication endpoints
- Token expiration (prevents indefinite access)
- User plan validation
- Secure by default configuration

**Password Policy:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Maximum 128 characters (prevent DoS)

---

### 5. Security Misconfiguration

**Implementation:**
- Environment-based configuration
- Helmet.js for security headers
- No default credentials
- Detailed error logging server-side only
- Production mode hides stack traces
- Configuration validation on startup

**Code Example:**
```javascript
// Security headers with Helmet
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
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Config validation
export const validateConfig = () => {
  const required = [
    { key: 'JWT_SECRET', value: config.jwt.secret },
    { key: 'MONGODB_URI', value: config.database.uri }
  ];
  
  const missing = required.filter(item => !item.value);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missingKeys}`);
  }
};
```

---

### 6. Vulnerable and Outdated Components

**Implementation:**
- Using latest stable versions of dependencies
- Regular security audits with `npm audit`
- Well-maintained packages (express, mongoose, bcrypt, etc.)
- No deprecated packages in production dependencies

**Run Security Audit:**
```bash
npm audit
npm audit fix  # Fix vulnerabilities automatically
```

---

### 7. Identification and Authentication Failures

**Implementation:**
- Multi-factor validation (email + password)
- Strong password requirements
- Secure session management via JWT
- Token expiration and refresh strategy
- Prevention of credential stuffing (rate limiting)
- No user enumeration

**Anti-Enumeration Example:**
```javascript
// Same error message for invalid email or password
const invalidCredentialsMessage = 'Invalid credentials. Please check your email and password.';

if (!user) {
  // Artificial delay to prevent timing attacks
  await new Promise(resolve => setTimeout(resolve, 100));
  return res.status(401).json({
    success: false,
    message: invalidCredentialsMessage
  });
}

const isPasswordValid = await user.comparePassword(password);

if (!isPasswordValid) {
  return res.status(401).json({
    success: false,
    message: invalidCredentialsMessage  // Same message!
  });
}
```

---

### 8. Software and Data Integrity Failures

**Implementation:**
- JWT signature verification
- Schema validation before database operations
- Atomic operations in MongoDB
- No unsigned or unverified code execution
- Environment variable validation

**Code Example:**
```javascript
// JWT verification with signature check
try {
  decoded = jwt.verify(token, process.env.JWT_SECRET);
} catch (error) {
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
}
```

---

### 9. Security Logging and Monitoring Failures

**Implementation:**
- Comprehensive error logging
- Request logging in development mode
- Authentication failure logging
- Sensitive data excluded from logs
- Timestamp on all log entries

**Code Example:**
```javascript
// Global error handler with logging
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Don't expose details to client
  res.status(statusCode).json({
    success: false,
    message: NODE_ENV === 'production' 
      ? 'An unexpected error occurred.'
      : err.message
  });
});
```

---

### 10. Server-Side Request Forgery (SSRF)

**Implementation:**
- Input validation on all URLs (when implemented for file uploads)
- Whitelist allowed domains for external requests
- No direct user input to external API calls
- S3 bucket policies and IAM roles (when configured)

---

## 🔐 Additional Security Measures

### Rate Limiting

**Purpose:** Prevent brute force attacks, credential stuffing, and DoS attacks.

**Implementation:**
```javascript
// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per IP
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Auth endpoint rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,                     // Only 5 attempts per IP
  skipSuccessfulRequests: true
});

app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
```

### Helmet Security Headers

**Headers Set:**
- `Content-Security-Policy`: Prevents XSS attacks
- `Strict-Transport-Security`: Enforces HTTPS
- `X-Content-Type-Options`: Prevents MIME sniffing
- `X-Frame-Options`: Prevents clickjacking
- `X-XSS-Protection`: Additional XSS protection

### Password Storage Best Practices

**Bcrypt Configuration:**
```javascript
// Cost factor determines computational cost
BCRYPT_ROUNDS=12  // Default (recommended for production)

// Higher values = more secure but slower
// 10 = Fast, suitable for development
// 12 = Recommended for production
// 14 = High security, slower
```

**Why Bcrypt?**
- Adaptive hash function
- Built-in salt generation
- Configurable cost factor
- Resistant to rainbow table attacks
- Constant-time comparison (prevents timing attacks)

### JWT Security

**Best Practices Implemented:**
1. **Strong Secret**: Minimum 32 characters, from environment
2. **Token Expiration**: Default 1 hour, configurable
3. **Minimal Payload**: Only userId and email (no sensitive data)
4. **Signature Verification**: Always verify before trusting
5. **Issuer/Audience Claims**: Additional validation layer

**Token Structure:**
```javascript
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "iat": 1701360000,
  "exp": 1701363600,
  "iss": "call-analyzer",
  "aud": "call-analyzer-users"
}
```

### Input Validation Layers

**Three-Layer Approach:**

1. **Joi Schema Validation** (routes/auth.js)
   - Type checking
   - Format validation
   - Business logic rules

2. **Mongoose Schema Validation** (models/User.js)
   - Database-level constraints
   - Data type enforcement
   - Required fields

3. **Custom Sanitization** (validators/auth.validator.js)
   - Remove dangerous characters
   - Normalize data
   - Additional security checks

---

## 🚀 Deployment Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong, random value (32+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `BCRYPT_ROUNDS` (12 or higher)
- [ ] Configure HTTPS at load balancer/reverse proxy
- [ ] Set up database authentication and encryption
- [ ] Configure CORS properly if building an API
- [ ] Enable MongoDB authentication
- [ ] Use strong database passwords
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy
- [ ] Review and limit exposed error messages
- [ ] Set up WAF (Web Application Firewall) if available
- [ ] Configure rate limiting based on traffic patterns
- [ ] Set up SSL/TLS certificates (Let's Encrypt)
- [ ] Regular security audits (`npm audit`)
- [ ] Keep dependencies updated
- [ ] Use environment variables for ALL secrets
- [ ] Never commit `.env` file to version control

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)

---

**Remember: Security is not a feature, it's a process. Regular audits and updates are essential!** 🔒
