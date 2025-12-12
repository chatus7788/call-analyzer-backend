import Joi from 'joi';

/**
 * Input Validation Schemas using Joi
 * OWASP Principles Applied:
 * - Strong password policy (min 8 chars, complexity requirements)
 * - Email validation and sanitization
 * - Name length and character validation
 * - Input sanitization to prevent injection attacks
 * - Clear error messages without exposing system details
 */

/**
 * Password validation schema
 * OWASP recommendations:
 * - Minimum 8 characters (industry standard)
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * - Maximum length to prevent DoS attacks
 */
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .required()
  .messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must not exceed 128 characters',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    'any.required': 'Password is required'
  });

/**
 * Email validation schema
 * OWASP: Validate and normalize email format
 */
const emailSchema = Joi.string()
  .email({ tlds: { allow: false } }) // Allow all TLDs
  .lowercase()
  .trim()
  .max(255)
  .required()
  .messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'string.max': 'Email must not exceed 255 characters',
    'any.required': 'Email is required'
  });

/**
 * Name validation schema
 * OWASP: Validate name format and length
 */
const nameSchema = Joi.string()
  .trim()
  .min(2)
  .max(100)
  .pattern(/^[a-zA-Z\s'-]+$/)
  .required()
  .messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 100 characters',
    'string.pattern.base': 'Name can only contain letters, spaces, hyphens, and apostrophes',
    'any.required': 'Name is required'
  });

/**
 * Registration validation schema
 */
export const registerSchema = Joi.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema
});

/**
 * Login validation schema
 * Note: Less strict validation on login to prevent user enumeration
 * Don't reveal whether email exists or password is wrong
 */
export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    })
});

/**
 * Validation middleware factory
 * Creates middleware that validates request body against a schema
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true // Remove unknown fields (security)
    });

    if (error) {
      // Extract error messages
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

/**
 * Sanitize string to prevent XSS and injection attacks
 * This is a basic sanitizer; for production, consider using a library like DOMPurify
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  // Remove potentially dangerous characters
  return str
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim();
};
