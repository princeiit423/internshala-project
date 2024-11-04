const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  companyWebsite: {
    type: String,
    required: false,
    trim: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  jobCategory: {
    type: String,
    enum: ['Technology', 'Marketing', 'Finance', 'Design'], // Specify the categories
    required: true
  },
  jobType: {
    type: String,
    enum: ['Full Time', 'Part Time', 'Contract'], // Specify the job types
    required: true
  },
  jobLocation: {
    type: String,
    required: true,
    trim: true
  },
  salaryRange: {
    type: String,
    required: false,
    trim: true
  },
  experience: {
    type: String,
    required: false,
    trim: true
  },
  qualification: {
    type: String,
    required: false,
    trim: true
  },
  applicationDeadline: {
    type: Date,
    required: false
  },
  applicationLink: {
    type: String,
    required: false,
    trim: true
  },
  jobDescription: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Job', jobSchema);
