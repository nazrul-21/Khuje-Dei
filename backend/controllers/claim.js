// controllers/claim.js
import Claim from '../models/claim.js';
import Item from '../models/item.js';
import User from '../models/user.js';
import mongoose from 'mongoose';
import { createNotification } from './notification.js';

// Create a new claim for an item
export const createClaim = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.userId;
    
    console.log(userId)
    // Validate objectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format'
      });
    }

    const item = await Item.findById(itemId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if item can be claimed
    if (item.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot claim an item with status: ${item.status}`
      });
    }

    // Check if user already has a pending claim for this item
    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: userId,
      status: 'pending'
    });

    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending claim for this item'
      });
    }

    // Extract claim data from request
    const { 
      proofOfOwnership,
      identifyingInformation,
      meetupDetails
    } = req.body;

    // Create a new claim
    const newClaim = new Claim({
      item: itemId,
      claimant: userId,
      proofOfOwnership,
      identifyingInformation,
      meetupDetails: meetupDetails || {}
    });

    const savedClaim = await newClaim.save();

    // Add claim ID to item's claims array
    await Item.findByIdAndUpdate(
      itemId,
      { $push: { claims: savedClaim._id } }
    );

    // Add item to user's claimedItems array
    await User.findByIdAndUpdate(
      userId,
      { $push: { claimedItems: itemId } }
    );

    // Notify item owner about the claim
    await createNotification({
      recipient: item.reportedBy,
      type: 'claim_submitted',
      item: itemId,
      claim: savedClaim._id,
      message: `Someone has submitted a claim for your item "${item.title}".`
    });

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully',
      claim: savedClaim
    });
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit claim',
      error: error.message
    });
  }
};

// Get all claims for a specific item
export const getItemClaims = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;
    
    // Validate objectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format'
      });
    }

    const item = await Item.findById(itemId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if user is authorized to view all claims
    const isAdmin = req.user.role === 'admin';
    const isItemOwner = item.reportedBy.toString() === userId;
    
    if (!isAdmin && !isItemOwner) {
      // If not admin or item owner, only return the user's own claims
      const userClaims = await Claim.find({
        item: itemId,
        claimant: userId
      }).populate('claimant', 'name email avatar averageRating');

      return res.status(200).json({
        success: true,
        claims: userClaims
      });
    }

    // Get all claims for this item
    const claims = await Claim.find({ item: itemId })
      .populate('claimant', 'name email avatar averageRating')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      claims
    });
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claims',
      error: error.message
    });
  }
};

// Get specific claim by ID
export const getClaimById = async (req, res) => {
  try {
    const { claimId } = req.params;
    const userId = req.user.id;
    
    // Validate objectId
    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid claim ID format'
      });
    }

    const claim = await Claim.findById(claimId)
      .populate('claimant', 'name email avatar averageRating')
      .populate({
        path: 'item',
        populate: {
          path: 'reportedBy',
          select: 'name email avatar averageRating'
        }
      });
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Check if user is authorized to view this claim
    const isAdmin = req.user.role === 'admin';
    const isItemOwner = claim.item.reportedBy._id.toString() === userId;
    const isClaimant = claim.claimant._id.toString() === userId;
    
    if (!isAdmin && !isItemOwner && !isClaimant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this claim'
      });
    }

    res.status(200).json({
      success: true,
      claim
    });
  } catch (error) {
    console.error('Error fetching claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claim',
      error: error.message
    });
  }
};

// Update claim status (admin or item owner)
export const updateClaimStatus = async (req, res) => {
  try {
    const { claimId } = req.params;
    const { status, meetupDetails, adminNotes } = req.body;
    const userId = req.user.id;
    
    // Validate objectId
    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid claim ID format'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const claim = await Claim.findById(claimId)
      .populate('item')
      .populate('claimant', 'name');
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Check if user is authorized to update this claim
    const isAdmin = req.user.role === 'admin';
    const isItemOwner = claim.item.reportedBy.toString() === userId;
    
    if (!isAdmin && !isItemOwner) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this claim'
      });
    }

    // Update fields
    claim.status = status;
    if (meetupDetails) claim.meetupDetails = meetupDetails;
    if (adminNotes) claim.adminNotes = adminNotes;
    claim.updatedAt = Date.now();

    const updatedClaim = await claim.save();

    // Update item status if claim is approved or resolved
    if (status === 'approved' || status === 'resolved') {
      await Item.findByIdAndUpdate(
        claim.item._id,
        { $set: { status: 'claimed' } }
      );

      // Reject all other pending claims
      await Claim.updateMany(
        {
          item: claim.item._id,
          _id: { $ne: claimId },
          status: 'pending'
        },
        { $set: { status: 'rejected', adminNotes: 'Another claim was approved.' } }
      );
    }

    // Notify claimant about status change
    await createNotification({
      recipient: claim.claimant._id,
      type: 'claim_status_change',
      item: claim.item._id,
      claim: claimId,
      message: `Your claim for "${claim.item.title}" has been ${status}.`
    });

    res.status(200).json({
      success: true,
      message: `Claim status updated to ${status}`,
      claim: updatedClaim
    });
  } catch (error) {
    console.error('Error updating claim status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update claim status',
      error: error.message
    });
  }
};