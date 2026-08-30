import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  asgardeoId: {
    type: String,
    sparse: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    sparse: true
  },
  name: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String
  },
  profilePic: {
    type: String
  },
  role: {
    type: String,
    enum: ['STUDENT', 'RECRUITER', 'ADMIN'],
    default: 'STUDENT'
  },
  bio: {
    type: String,
    maxLength: 500
  },
  technologies: [{
    type: String
  }],
  location: {
    type: String
  },
  institute: {
    type: String
  },
  isNewUser: {
    type: Boolean,
    default: true
  },
  isDisabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
