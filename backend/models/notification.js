import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const NotificationSchema = new Schema({
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['claim_submitted', 'claim_status_change', 'item_status_change', 'new_item_match', 'item_expired', 'rating_received', 'item_followed'],
      required: true
    },
    item: {
      type: Schema.Types.ObjectId,
      ref: 'Item'
    },
    claim: {
      type: Schema.Types.ObjectId,
      ref: 'Claim'
    },
    message: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    actionLink: {
      type: String
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }, { timestamps: true });


  const Notification = mongoose.model('Notification', NotificationSchema);
  export default Notification;
