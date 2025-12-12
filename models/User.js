import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name must not exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          // Basic email validation at database level
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false // Don't include password hash in queries by default (security)
    },
    plan: {
      type: String,
      enum: {
        values: ['free', 'pro'],
        message: '{VALUE} is not a valid plan'
      },
      default: 'free'
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    // Exclude passwordHash from JSON responses by default
    toJSON: {
      transform: function(doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      transform: function(doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Index on email for faster lookups and to enforce uniqueness
userSchema.index({ email: 1 });

/**
 * Hash password before saving to database
 * OWASP: Never store plain passwords
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    // Use bcrypt with a strong cost factor (from env or default to 12)
    // OWASP recommends cost factor of 12-14 for modern systems
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare provided password with stored hash
 * OWASP: Use constant-time comparison to prevent timing attacks
 * @param {string} candidatePassword - Plain text password to verify
 * @returns {Promise<boolean>} - True if password matches
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // bcrypt.compare uses constant-time comparison
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    // Log error server-side, don't expose details to client
    console.error('Password comparison error:', error);
    return false;
  }
};

/**
 * Get user without sensitive fields
 * @returns {Object} - Safe user object
 */
userSchema.methods.getSafeProfile = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    plan: this.plan,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const User = mongoose.model('User', userSchema);

export default User;
