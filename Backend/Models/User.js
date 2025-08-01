const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Agent'],
    default: 'Agent',
    required: true
  },
  mobile: {
    type: String,
    required: false,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
