import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    token: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['access', 'refresh'],
      required: true
    },
    blacklisted: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date,
      required: true
    }
  });

const Token = mongoose.model('Token', TokenSchema);
export default Token;