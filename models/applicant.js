const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: /.+\@.+\..+/ // Basic email format validation
  },
  phone: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  jobType: {
    type: String,
    required: true,
    enum: ['full-time', 'part-time', 'freelance', 'internship'] // Restrict values to specified options
  },
  location: {
    type: String,
    required: true,
  },
  expectedSalary: {
    type: Number,
    required: true,
  },
  resume: {
    filename: {
      type: String,
      //required: true,
    },
    url: {
      type: String,
      //required: true,
    }
  },
  coverLetter: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Applicant', applicantSchema);
