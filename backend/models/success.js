import mongoose from 'mongoose';

const SuccessSchema = new mongoose.Schema({
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      successCount: {
        type: Number,
        required: true
      }
})

const Success = mongoose.model('Success', SuccessSchema);
export default Success;