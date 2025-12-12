# Call Analyzer - Authentication System

A secure Node.js + Express authentication system following OWASP security best practices.

## 🔐 Security Features

This implementation includes the following OWASP security principles:

- ✅ **Strong Password Policy**: Minimum 8 characters with complexity requirements
- ✅ **Bcrypt Hashing**: Password hashing with configurable cost factor (default: 12)
- ✅ **JWT Authentication**: Stateless authentication with token expiration
- ✅ **Input Validation**: Joi-based validation for all inputs
- ✅ **Rate Limiting**: Protection against brute force attacks
- ✅ **Helmet Security Headers**: Protection against common web vulnerabilities
- ✅ **No User Enumeration**: Generic error messages on login failures
- ✅ **Secure Error Handling**: No stack traces exposed in production
- ✅ **Environment-based Configuration**: Sensitive data in environment variables

## 📁 Project Structure

```
call-analyzer/
├── app.js                      # Main Express application
├── models/
│   └── User.js                 # User Mongoose model
├── routes/
│   └── auth.js                 # Authentication routes
├── middlewares/
│   └── auth.js                 # JWT authentication middleware
├── validators/
│   └── auth.validator.js       # Input validation schemas
├── package.json                # Dependencies
├── .env.example                # Environment variables template
└── .gitignore                  # Git ignore rules
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Redis (for BullMQ - future feature)

### Installation

1. **Clone the repository** (or navigate to the project directory):
   ```bash
   cd /Users/mac/Desktop/call-analyzer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file** and configure the following:
   ```bash
   # Generate a strong JWT secret (example command):
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

   Update `.env`:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/call-analyzer
   JWT_SECRET=your-generated-secret-here
   JWT_EXPIRES_IN=1h
   BCRYPT_ROUNDS=12
   ```

5. **Start MongoDB** (if not already running):
   ```bash
   # macOS with Homebrew:
   brew services start mongodb-community
   
   # Or manually:
   mongod --config /usr/local/etc/mongod.conf
   ```

6. **Start the server**:
   ```bash
   # Development mode (with auto-reload):
   npm run dev
   
   # Production mode:
   npm start
   ```

## 📡 API Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-30T12:00:00.000Z"
}
```

---

### Register New User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "plan": "free",
      "createdAt": "2025-11-30T12:00:00.000Z",
      "updatedAt": "2025-11-30T12:00:00.000Z"
    }
  }
}
```

---

### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "plan": "free",
      "createdAt": "2025-11-30T12:00:00.000Z",
      "updatedAt": "2025-11-30T12:00:00.000Z"
    }
  }
}
```

---

### Get Current User Profile
```http
GET /auth/me
Authorization: Bearer <your-jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "plan": "free",
      "createdAt": "2025-11-30T12:00:00.000Z",
      "updatedAt": "2025-11-30T12:00:00.000Z"
    }
  }
}
```

---

## 🔒 OWASP Security Principles Applied

### 1. **Input Validation & Sanitization**
- All inputs validated using Joi schemas
- Email normalization (lowercase, trim)
- Name validation (alphanumeric + specific characters only)
- Password complexity requirements enforced

### 2. **Strong Password Policy**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)
- Maximum 128 characters (prevent DoS)

### 3. **Password Storage**
- **Never** store plain passwords
- Bcrypt hashing with salt (cost factor: 12)
- Passwords excluded from queries by default
- Pre-save hook ensures automatic hashing

### 4. **Prevent User Enumeration**
- Generic error messages on login failure
- Same response time for existing/non-existing users
- Artificial delays on failed login attempts

### 5. **JWT Security**
- Strong secret from environment variables
- Token expiration (default: 1 hour)
- Minimal data in payload (no sensitive info)
- Issuer and audience claims for validation

### 6. **Secure Error Handling**
- Stack traces only in development mode
- Generic error messages in production
- Detailed logging server-side only
- Appropriate HTTP status codes

### 7. **Rate Limiting**
- General API limit: 100 requests per 15 minutes
- Auth endpoints: 5 attempts per 15 minutes
- Protects against brute force attacks

### 8. **Security Headers (Helmet)**
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Content-Type-Options
- X-Frame-Options
- And more...

### 9. **HTTPS Assumption**
- Production assumes HTTPS termination at proxy/load balancer
- Secure flag on cookies (when implemented)

### 10. **Environment Configuration**
- All sensitive data in environment variables
- No hardcoded secrets
- Example file provided (.env.example)

## 🧪 Testing the API

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Get Profile:**
```bash
# Replace <TOKEN> with the actual JWT token from login/register
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

### Using Postman or Thunder Client

1. Import the endpoints above
2. For protected routes, add header: `Authorization: Bearer <your-token>`
3. Test various scenarios (invalid inputs, missing fields, etc.)

## 📝 Error Handling Examples

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Authentication required. Please provide a valid token."
}
```

### Duplicate User (409)
```json
{
  "success": false,
  "message": "A user with this email already exists"
}
```

### Rate Limit Exceeded (429)
```json
{
  "success": false,
  "message": "Too many authentication attempts, please try again later."
}
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `3000` | No |
| `MONGODB_URI` | MongoDB connection string | - | **Yes** |
| `JWT_SECRET` | Secret key for JWT signing | - | **Yes** |
| `JWT_EXPIRES_IN` | JWT token expiration | `1h` | No |
| `BCRYPT_ROUNDS` | Bcrypt cost factor | `12` | No |

### Bcrypt Cost Factor

The bcrypt cost factor determines the computational cost of hashing:
- **10**: Fast, less secure (development)
- **12**: Recommended for production (default)
- **14**: Very secure, slower (high-security applications)

Adjust in `.env`:
```env
BCRYPT_ROUNDS=12
```

## 🚧 Next Steps

This authentication system is ready for:
- Call recording upload endpoints (with S3 integration)
- AssemblyAI transcription processing
- BullMQ job queue for background tasks
- Redis session storage (optional)
- Additional user management features

## 📚 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT generation/verification
- **joi**: Input validation
- **helmet**: Security headers
- **express-rate-limit**: Rate limiting
- **dotenv**: Environment configuration

## 🤝 Contributing

Follow these security principles when adding new features:
1. Always validate and sanitize inputs
2. Never expose sensitive data in responses
3. Use environment variables for secrets
4. Apply rate limiting to sensitive endpoints
5. Log errors server-side only
6. Follow the existing code structure

## 📄 License

ISC

---

**Built with security in mind following OWASP best practices** 🔒
