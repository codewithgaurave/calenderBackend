const mongoose = require('mongoose');

const RemarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    trim: true
  },
  mobileNumber: {
    type: String,
    trim: true
  },
  fromAddress: {
    type: String,
    trim: true
  },
  toAddress: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
  },
  content: {
    type: String,
    trim: true
  },
  // Financial tracking fields based on your form
  totalAmount: {
    type: Number,
    default: 0
  },
  advanceAmount: {
    type: Number,
    default: 0
  },
  pendingAmount: {
    type: Number,
    default: function() {
      return this.totalAmount - this.advanceAmount;
    }
  },
  // Special notes field
  specialNote: {
    type: String,
    trim: true
  },
  // Status tracking
  done: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  // Additional metadata
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
RemarkSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate pending amount before saving
RemarkSchema.pre('save', function(next) {
  if (this.totalAmount && this.advanceAmount) {
    this.pendingAmount = this.totalAmount - this.advanceAmount;
  }
  next();
});

module.exports = mongoose.model('Remark', RemarkSchema);