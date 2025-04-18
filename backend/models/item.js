import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Clothing', 'Accessories', 'Documents', 'Pets', 'Other']
  },
  type: {
    type: String,
    required: true,
    enum: ['lost', 'found']
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'claimed', 'resolved', 'expired'],
    default: 'active'
  },
  location: {
    name: { type: String, required: true },
    coordinates: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
    }
  },
  images: [String],
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateLostOrFound: {
    type: Date,
    required: true
  },
  reportedDate: {
    type: Date,
    default: Date.now
  },
  identifyingCharacteristics: [{
    name: { type: String },
    value: { type: String }
  }],
  reward: {
    amount: { type: Number, default: 0 },
    description: { type: String },
    isOffered: { type: Boolean, default: false }
  },
  followers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],
  claims: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim'
  }],
  tags: [{ type: String }]
}, { timestamps: true });

// Indexing for search functionality
ItemSchema.index({ title: 'text', description: 'text', tags: 'text' });
ItemSchema.index({ category: 1 });
ItemSchema.index({ status: 1 });
ItemSchema.index({ 'location.name': 1 });

const Item = mongoose.model('Item', ItemSchema);
export default Item;