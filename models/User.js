const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
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
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password should be at least 6 characters long']
  },
  profileImage: {
    type: String,
    default: null // Will store the file path or URL
  },
  profileImagePublicId: {
    type: String,
    default: null // For Cloudinary public ID (if using Cloudinary)
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
UserSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// ❌ Removed bcrypt hashing
// ✅ Plain text password compare
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return candidatePassword === this.password;
};

// Method to get user data without password
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', UserSchema);
