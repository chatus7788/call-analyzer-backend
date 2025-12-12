/**
 * EXAMPLE USAGE GUIDE
 * This file demonstrates how to use the authentication system
 * with real-world examples and best practices
 */

/* ============================================
 * 1. REGISTERING A NEW USER
 * ============================================ */

// HTTP Request Example
const registerExample = {
  method: 'POST',
  url: 'http://localhost:3000/auth/register',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'SecurePass123!'
  }
};

// Expected Response (201 Created)
const registerResponse = {
  success: true,
  message: 'User registered successfully',
  data: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTdhMmIzZDRlNWY2NzhhOTBiMWMyZGUiLCJlbWFpbCI6ImFsaWNlQGV4YW1wbGUuY29tIiwiaWF0IjoxNzAxMzYwMDAwLCJleHAiOjE3MDEzNjM2MDAsImlzcyI6ImNhbGwtYW5hbHl6ZXIiLCJhdWQiOiJjYWxsLWFuYWx5emVyLXVzZXJzIn0.xyz123',
    user: {
      id: '657a2b3d4e5f678a90b1c2de',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      plan: 'free',
      createdAt: '2025-11-30T12:00:00.000Z',
      updatedAt: '2025-11-30T12:00:00.000Z'
    }
  }
};

// Validation Errors Example (400 Bad Request)
const validationErrorResponse = {
  success: false,
  message: 'Validation failed',
  errors: [
    {
      field: 'password',
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
    },
    {
      field: 'email',
      message: 'Please provide a valid email address'
    }
  ]
};

/* ============================================
 * 2. LOGGING IN
 * ============================================ */

// HTTP Request Example
const loginExample = {
  method: 'POST',
  url: 'http://localhost:3000/auth/login',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    email: 'alice@example.com',
    password: 'SecurePass123!'
  }
};

// Expected Response (200 OK)
const loginResponse = {
  success: true,
  message: 'Login successful',
  data: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    user: {
      id: '657a2b3d4e5f678a90b1c2de',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      plan: 'free',
      createdAt: '2025-11-30T12:00:00.000Z',
      updatedAt: '2025-11-30T12:00:00.000Z'
    }
  }
};

// Invalid Credentials Error (401 Unauthorized)
const invalidCredentialsResponse = {
  success: false,
  message: 'Invalid credentials. Please check your email and password.'
};

/* ============================================
 * 3. ACCESSING PROTECTED ROUTES
 * ============================================ */

// HTTP Request Example
const getMeExample = {
  method: 'GET',
  url: 'http://localhost:3000/auth/me',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
};

// Expected Response (200 OK)
const getMeResponse = {
  success: true,
  data: {
    user: {
      id: '657a2b3d4e5f678a90b1c2de',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      plan: 'free',
      createdAt: '2025-11-30T12:00:00.000Z',
      updatedAt: '2025-11-30T12:00:00.000Z'
    }
  }
};

// Missing Token Error (401 Unauthorized)
const missingTokenResponse = {
  success: false,
  message: 'Authentication required. Please provide a valid token.'
};

// Expired Token Error (401 Unauthorized)
const expiredTokenResponse = {
  success: false,
  message: 'Token has expired. Please log in again.'
};

/* ============================================
 * 4. JAVASCRIPT FETCH API EXAMPLES
 * ============================================ */

// Register User
async function registerUser(name, email, password) {
  try {
    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (data.success) {
      // Store token in localStorage or secure storage
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

// Login User
async function loginUser(email, password) {
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      // Store token
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// Get Current User Profile
async function getCurrentUser() {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('http://localhost:3000/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      return data.data.user;
    } else {
      // Token might be expired, clear storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Failed to get user:', error);
    throw error;
  }
}

// Logout User
function logoutUser() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

/* ============================================
 * 5. AXIOS EXAMPLES
 * ============================================ */

import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Register with Axios
async function registerWithAxios(name, email, password) {
  try {
    const response = await api.post('/auth/register', {
      name,
      email,
      password
    });

    const { token, user } = response.data.data;
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));

    return { token, user };
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error);
    throw error;
  }
}

// Login with Axios
async function loginWithAxios(email, password) {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    });

    const { token, user } = response.data.data;
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));

    return { token, user };
  } catch (error) {
    console.error('Login failed:', error.response?.data || error);
    throw error;
  }
}

// Get current user with Axios
async function getCurrentUserWithAxios() {
  try {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  } catch (error) {
    console.error('Failed to get user:', error.response?.data || error);
    throw error;
  }
}

/* ============================================
 * 6. CURL EXAMPLES
 * ============================================ */

// Register
const curlRegister = `
curl -X POST http://localhost:3000/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "SecurePass123!"
  }'
`;

// Login
const curlLogin = `
curl -X POST http://localhost:3000/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "alice@example.com",
    "password": "SecurePass123!"
  }'
`;

// Get Current User
const curlGetMe = `
curl -X GET http://localhost:3000/auth/me \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
`;

/* ============================================
 * 7. ERROR HANDLING BEST PRACTICES
 * ============================================ */

async function robustLogin(email, password) {
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    // Handle different status codes
    switch (response.status) {
      case 200:
        // Success
        localStorage.setItem('authToken', data.data.token);
        return { success: true, data: data.data };

      case 401:
        // Invalid credentials
        return { 
          success: false, 
          error: 'Invalid email or password' 
        };

      case 429:
        // Rate limit exceeded
        return { 
          success: false, 
          error: 'Too many login attempts. Please try again later.' 
        };

      case 400:
        // Validation error
        return { 
          success: false, 
          error: data.errors?.[0]?.message || 'Invalid input' 
        };

      default:
        // Server error
        return { 
          success: false, 
          error: 'An unexpected error occurred. Please try again.' 
        };
    }
  } catch (error) {
    // Network error
    console.error('Network error:', error);
    return { 
      success: false, 
      error: 'Could not connect to server. Please check your internet connection.' 
    };
  }
}

/* ============================================
 * 8. PASSWORD VALIDATION EXAMPLES
 * ============================================ */

// Valid passwords
const validPasswords = [
  'SecurePass123!',
  'MyP@ssw0rd',
  'Test1234!@',
  'Abcd1234!',
  'P@ssword123'
];

// Invalid passwords (will be rejected)
const invalidPasswords = [
  'password',           // No uppercase, number, or special char
  'PASSWORD123',        // No lowercase or special char
  'Password',           // No number or special char
  'Pass123',           // Too short (< 8 chars)
  'password123',       // No uppercase or special char
  'Password!',         // No number
  'Pass!123'           // No uppercase
];

/* ============================================
 * 9. INTEGRATION WITH FRONTEND FRAMEWORKS
 * ============================================ */

// React Example - Auth Context
/*
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  const login = async (email, password) => {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      setToken(data.data.token);
      setUser(data.data.user);
      localStorage.setItem('authToken', data.data.token);
      return true;
    }
    return false;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
*/

/* ============================================
 * 10. SECURITY BEST PRACTICES
 * ============================================ */

// ✅ DO: Store token securely
// For web: httpOnly cookies (requires backend changes)
// For mobile: Secure storage (Keychain/KeyStore)
// For web (alternative): localStorage with XSS protection

// ✅ DO: Clear token on logout
function secureLogout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  // Optionally: Call backend logout endpoint
  // await fetch('/auth/logout', { method: 'POST' });
}

// ✅ DO: Check token expiration before using
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// ✅ DO: Implement token refresh (future feature)
// async function refreshToken() {
//   const response = await fetch('/auth/refresh', {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${oldToken}`
//     }
//   });
//   // Update token
// }

// ❌ DON'T: Store sensitive data in JWT
// ❌ DON'T: Use JWT for sessions (use Redis/DB instead)
// ❌ DON'T: Ignore token expiration
// ❌ DON'T: Store passwords in frontend

export {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  registerWithAxios,
  loginWithAxios,
  getCurrentUserWithAxios,
  robustLogin,
  secureLogout,
  isTokenExpired
};
