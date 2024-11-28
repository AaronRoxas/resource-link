const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// First, drop the existing indexes
// mongoose.connection.collections.users.dropIndexes();

const userSchema = new mongoose.Schema({
  employee_id: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true
  },
  first_name: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  last_name: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [4, 'Password must be at least 4 characters']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    lowercase: true,
    enum: {
      values: ['admin', 'teacher', 'staff'],
      message: '{VALUE} is not a valid role'
    }
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Remove password when converting to JSON
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

// Drop old indexes and create new ones
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ employee_id: 1 }, { unique: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
