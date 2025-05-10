import mongoose from 'mongoose';

const VolunteerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  level: {
    type: String,
    enum: ['junior', 'senior', 'lead'],
    default: 'junior'
  },
  application: {
    reason: {
      type: String,
      required: true
    },
    experience: {
      type: String,
      required: true
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  stats: {
    itemsHelped: {
      type: Number,
      default: 0
    },
    casesResolved: {
      type: Number,
      default: 0
    },
    joinedAt: Date
  },
  specializations: [String],
  availability: {
    type: String,
    enum: ['weekdays', 'weekends', 'evenings', 'fulltime'],
    default: 'weekends'
  },
  location: {
    city: String,
    area: String
  },
  bio: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Volunteer = mongoose.model('Volunteer', VolunteerSchema);
export default Volunteer;
