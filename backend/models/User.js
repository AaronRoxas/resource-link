const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId, // Default ID type
        auto: true,                           // Auto-generate this field
      },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'Admin', 'staff', 'Staff', 'teacher', 'Teacher'], // Allow both cases
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
