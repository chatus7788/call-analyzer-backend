# Quick Start Guide

Get your Call Analyzer authentication system up and running in 5 minutes!

## ⚡ Prerequisites

Make sure you have these installed:
- **Node.js** v16+ ([Download](https://nodejs.org/))
- **MongoDB** v5+ ([Download](https://www.mongodb.com/try/download/community))
- **npm** or **yarn** (comes with Node.js)

---

## 🚀 Step 1: Install Dependencies

Dependencies are already installed! If you need to reinstall:

```bash
cd /Users/mac/Desktop/call-analyzer
npm install
```

---

## 🔧 Step 2: Configure Environment

1. **The `.env` file is already created**, but you need to update the JWT secret:

```bash
# Generate a strong JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

2. **Copy the generated secret** and update `.env`:

```env
JWT_SECRET=paste-your-generated-secret-here
```

---

## 🗄️ Step 3: Start MongoDB

**If MongoDB is not running**, start it:

### macOS (Homebrew):
```bash
brew services start mongodb-community
```

### macOS (Manual):
```bash
mongod --config /usr/local/etc/mongod.conf --fork
```

### Linux:
```bash
sudo systemctl start mongod
```

### Windows:
```bash
net start MongoDB
```

**Verify MongoDB is running:**
```bash
mongosh --eval "db.version()"
```

---

## 🎯 Step 4: Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 3000
📊 Environment: development
🔒 Security features enabled: Helmet, Rate Limiting
```

---

## 🧪 Step 5: Test the API

### Option A: Using the Test Script

Open a **new terminal** and run:

```bash
node scripts/test-api.js
```

This will automatically test all endpoints!

### Option B: Manual Testing with cURL

**Register a new user:**
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

**Get your profile** (replace `<TOKEN>` with the token from login):
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

### Option C: Using a REST Client

1. Install **Thunder Client** or **Postman** VS Code extension
2. Import these requests:
   - POST `http://localhost:3000/auth/register`
   - POST `http://localhost:3000/auth/login`
   - GET `http://localhost:3000/auth/me` (with Authorization header)

---

## ✅ What You Should See

### Successful Registration:
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

### Successful Login:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

---

## 🎉 You're All Set!

Your authentication system is now running with:
- ✅ Secure password hashing (bcrypt)
- ✅ JWT token authentication
- ✅ Input validation
- ✅ Rate limiting
- ✅ Security headers
- ✅ OWASP best practices

---

## 🐛 Troubleshooting

### MongoDB Connection Error

**Error:** `MongooseServerSelectionError`

**Solution:**
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community
```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port in .env
PORT=3001
```

### JWT Secret Warning

**Warning:** `JWT_SECRET should be at least 32 characters long`

**Solution:**
```bash
# Generate a new secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Update .env file
```

### Dependencies Installation Failed

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

## 📖 Next Steps

1. **Read the full documentation:** `README.md`
2. **Review security practices:** `docs/SECURITY.md`
3. **Start building features:**
   - File upload with S3
   - Call transcription with AssemblyAI
   - Background jobs with BullMQ

---

## 🔧 Development Commands

```bash
# Start server
npm start

# Start with auto-reload (development)
npm run dev

# Test API
node scripts/test-api.js

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## 🆘 Need Help?

- Check `README.md` for detailed documentation
- Review `docs/SECURITY.md` for security implementation details
- Look at the code comments in each file
- Check the console logs for detailed error messages

---

**Happy Coding! 🚀**
