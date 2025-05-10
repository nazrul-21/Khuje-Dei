import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
<<<<<<< HEAD
      enum: ['user', 'admin'],
=======
      enum: ['user', 'volunteer', 'admin'],
>>>>>>> origin/main
      default: 'user'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  });

const User = mongoose.model('User', UserSchema);
<<<<<<< HEAD
export default User;
=======
export default User;
>>>>>>> origin/main
