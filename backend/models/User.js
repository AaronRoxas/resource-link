const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Add a counter schema for auto-incrementing IDs
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

const userSchema = new mongoose.Schema({
  employee_id: {
    type: String,
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
  },
  passwordResetRequested: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Pre-validate middleware to set employee_id
userSchema.pre('validate', async function(next) {
  try {
    if (!this.employee_id) {
      // Find the highest employee_id
      const highestUser = await this.constructor.findOne({}, { employee_id: 1 })
        .sort({ employee_id: -1 }); // Sort in descending order
      
      let nextNum = 1; // Default start
      
      if (highestUser && highestUser.employee_id) {
        // Extract the number from existing highest employee_id (e.g., "EMP009" -> 9)
        const currentNum = parseInt(highestUser.employee_id.replace('EMP', ''));
        nextNum = currentNum + 1;
      }

      // Format: EMP001, EMP002, etc.
      this.employee_id = `EMP${nextNum.toString().padStart(3, '0')}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  try {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error);
  }
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

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Initialize counter if it doesn't exist
async function initCounter() {
  try {
    const counter = await Counter.findById('employeeId');
    if (!counter) {
      await new Counter({ _id: 'employeeId', seq: 0 }).save();
    }
  } catch (error) {
    console.error('Error initializing counter:', error);
  }
}

// Call this when your application starts
initCounter();

const User = mongoose.model('User', userSchema);
module.exports = User;
