import User from '../models/user.js';
import Volunteer from '../models/volunteer.js';
import mongoose from 'mongoose';



// Promote volunteer to a higher level
export const promoteVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const { level, reason } = req.body;
    
    // Validate level
    if (!['junior', 'senior', 'lead'].includes(level)) {
      return res.status(400).json({ message: 'Invalid volunteer level' });
    }
    
    // Find and update the volunteer
    const volunteer = await Volunteer.findById(volunteerId);
    
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    
    if (volunteer.status !== 'approved') {
      return res.status(400).json({ message: 'Cannot promote a volunteer who is not approved' });
    }
    
    // Update the volunteer level
    volunteer.level = level;
    volunteer.updatedAt = Date.now();
    
    // Save the promotion reason in a new field or as a notification
    // You could add a promotionHistory array to track promotions
    
    await volunteer.save();
    
    // Optionally send notification to the volunteer
    // await sendPromotionNotification(volunteer.user, level, reason);
    
    return res.status(200).json({ 
      message: 'Volunteer promoted successfully',
      volunteer
    });
  } catch (error) {
    console.error('Error promoting volunteer:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all volunteers
export const getAllVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find({ status: 'approved' })
      .populate('user', 'name email createdAt')
      .sort({ 'stats.joinedAt': -1 });
    
    res.status(200).json(volunteers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Apply to become a volunteer
export const applyForVolunteer = async (req, res) => {
  console.log('applyForVolunteer function called');
  try {
    const { reason, experience, availability, location, specializations, bio } = req.body;
    
    if (!reason || !experience) {
      return res.status(400).json({ message: 'Please provide reason and experience' });
    }
    
    // Check if user exists
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if already a volunteer
    if (user.role === 'volunteer') {
      return res.status(400).json({ message: 'You are already a volunteer' });
    }
    
    // Check if application already exists
    const existingApplication = await Volunteer.findOne({ user: req.user.userId });
    if (existingApplication) {
      return res.status(400).json({ 
        message: `You already have a ${existingApplication.status} volunteer application` 
      });
    }
    
    // Create new volunteer application
    const volunteer = new Volunteer({
      user: req.user.userId,
      application: {
        reason,
        experience,
        appliedAt: new Date()
      },
      availability: availability || 'weekends',
      location: location || {},
      specializations: specializations || [],
      bio: bio || ''
    });
    
    await volunteer.save();
    
    res.status(201).json({ 
      message: 'Volunteer application submitted successfully',
      applicationId: volunteer._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get volunteer applications (admin only)
export const getVolunteerApplications = async (req, res) => {
  try {
    const applications = await Volunteer.find({ status: { $in: ['pending', 'rejected'] } })  
  .populate('user', 'name email createdAt')
  .sort({ 'application.appliedAt': -1 });

    
    res.status(200).json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve volunteer application (admin only)
export const approveVolunteerApplication = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer application not found' });
    }
    
    if (volunteer.status === 'approved') {
      return res.status(400).json({ message: 'Application is not pending' });
    }
    
    // Update volunteer status
    volunteer.status = 'approved';
    volunteer.stats.joinedAt = new Date();
    volunteer.updatedAt = new Date();
    
    // Update user role
    const user = await User.findById(volunteer.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.role = 'volunteer';
    user.updatedAt = new Date();
    
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      await volunteer.save({ session });
      await user.save({ session });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
    
    res.status(200).json({ message: 'Volunteer application approved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject volunteer application (admin only)
export const rejectVolunteerApplication = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const { reason } = req.body;
    
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer application not found' });
    }
    
    if (volunteer.status !== 'pending') {
      return res.status(400).json({ message: 'Application is not pending' });
    }
    
    volunteer.status = 'rejected';
    volunteer.rejectionReason = reason || 'No reason provided';
    volunteer.updatedAt = new Date();
    
    await volunteer.save();
    
    res.status(200).json({ message: 'Volunteer application rejected' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove volunteer status (admin only)
export const removeVolunteerStatus = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const { reason } = req.body;
    
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    
    if (volunteer.status !== 'approved') {
      return res.status(400).json({ message: 'Volunteer is not approved' });
    }
    
    // Update volunteer status
    volunteer.status = 'rejected';
    volunteer.rejectionReason = reason || 'Volunteer status revoked by admin';
    volunteer.updatedAt = new Date();
    
    // Update user role
    const user = await User.findById(volunteer.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.role = 'user';
    user.updatedAt = new Date();
    
    // Use a transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      await volunteer.save({ session });
      await user.save({ session });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
    
    res.status(200).json({ message: 'Volunteer status removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get volunteer application status (for current user)
export const getMyVolunteerStatus = async (req, res) => {
  try {
    console.log(req.user)
    const volunteer = await Volunteer.findOne({ user: req.user.userId });
    
    if (!volunteer) {
      return res.status(404).json({ 
        hasApplied: false,
        message: 'No volunteer application found' 
      });
    }
    
    res.status(200).json({
      hasApplied: true,
      status: volunteer.status,
      application: volunteer.application,
      stats: volunteer.stats,
      rejectionReason: volunteer.rejectionReason
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update volunteer profile (for volunteers)
export const updateVolunteerProfile = async (req, res) => {
  try {
    const { bio, availability, location, specializations } = req.body;
    
    const volunteer = await Volunteer.findOne({ 
      user: req.user.userId,
      status: 'approved'
    });
    
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer profile not found or not approved' });
    }
    
    if (bio) volunteer.bio = bio;
    if (availability) volunteer.availability = availability;
    if (location) volunteer.location = location;
    if (specializations) volunteer.specializations = specializations;
    
    volunteer.updatedAt = new Date();
    await volunteer.save();
    
    res.status(200).json({ 
      message: 'Volunteer profile updated successfully',
      volunteer
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get volunteer profile by ID
export const getVolunteerById = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    console.log(volunteerId);
    const volunteer = await Volunteer.findById(volunteerId)
      .populate('user', 'name email createdAt');
    
    if (!volunteer || volunteer.status !== 'approved') {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    
    res.status(200).json(volunteer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
