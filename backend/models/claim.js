import mongoose from "mongoose";

const Schema = mongoose.Schema;
const ClaimSchema = new Schema({
    item: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    claimant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    proofOfOwnership: {
      description: { type: String, required: false },
      images: [{
        url: { type: String },
        public_id: { type: String }
      }]
    },
    identifyingInformation: [{
      name: { type: String },
      value: { type: String }
    }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    adminNotes: {
      type: String
    },
    rewardPayment: {
      isPaid: { type: Boolean, default: false },
      amount: { type: Number },
      paymentDate: { type: Date },
      paymentMethod: { type: String },
      transactionId: { type: String }
    },
    meetupDetails: {
      date: { type: Date },
      location: { type: String },
      notes: { type: String }
    }
  }, { timestamps: true });

const Claim = mongoose.model('Claim', ClaimSchema);
export default Claim;