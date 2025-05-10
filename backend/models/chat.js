// models/botChat.js
import mongoose from 'mongoose';

const BotChatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [{
    isBot: {
      type: Boolean,
      default: false
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const BotChat = mongoose.model('BotChat', BotChatSchema);
export default BotChat;