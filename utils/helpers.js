/**
 * Utility Functions
 * Common helper functions used throughout the application
 */

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
export const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Delay execution for a specified time
 * Useful for preventing timing attacks
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input string
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim();
};

/**
 * Format error response
 * @param {string} message - Error message
 * @param {Array} errors - Array of error details (optional)
 * @returns {Object} Formatted error response
 */
export const formatErrorResponse = (message, errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors && errors.length > 0) {
    response.errors = errors;
  }
  
  return response;
};

/**
 * Format success response
 * @param {string} message - Success message
 * @param {Object} data - Response data (optional)
 * @returns {Object} Formatted success response
 */
export const formatSuccessResponse = (message, data = null) => {
  const response = {
    success: true,
    message
  };
  
  if (data) {
    response.data = data;
  }
  
  return response;
};

/**
 * Check if email is valid
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate JWT token payload
 * @param {Object} user - User object
 * @returns {Object} JWT payload
 */
export const generateTokenPayload = (user) => {
  return {
    userId: user._id.toString(),
    email: user.email
  };
};
