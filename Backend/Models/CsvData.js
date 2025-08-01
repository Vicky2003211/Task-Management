const mongoose = require('mongoose');

const CsvDataSchema = new mongoose.Schema({
  Task_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'In-progress', 'Completed'],
    default: 'Pending',
    required: true
  },
  assignedAgent: {
    type: String,
    required: false,
    default: null,
    trim: true
  }
}, {
  timestamps: true
});

// Database indexes for performance
CsvDataSchema.index({ Task_id: 1 });
CsvDataSchema.index({ phone: 1 });
CsvDataSchema.index({ status: 1 });
CsvDataSchema.index({ assignedAgent: 1 });

module.exports = mongoose.model('CsvData', CsvDataSchema); 