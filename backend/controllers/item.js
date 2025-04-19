// controllers/item.js
import Item from '../models/item.js';
import User from '../models/user.js';
import sendEmail from '../utils/sendEmail.js';
import mongoose from 'mongoose';

// Helper function to check if user owns the item
const isItemOwner = (item, userId) => {
  return item.reportedBy.toString() === userId.toString();
};

// Create a new item
export const createItem = async (req, res) => {
  try {
    // Parse the JSON data if it's sent as a string
    let itemData = req.body;
    if (req.body.data) {
      itemData = JSON.parse(req.body.data);
    }
    
    const { 
      title, 
      description, 
      category, 
      type, 
      location, 
      dateLostOrFound, 
      identifyingCharacteristics,
      reward,
      tags
    } = itemData;

    console.log(req.user);

    // Process uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      // Create array of file paths
      images = req.files.map(file => `/uploads/${file.filename}`);
    }
    console.log(images);

    const newItem = new Item({
      title,
      description,
      category,
      type,
      location,
      dateLostOrFound: new Date(dateLostOrFound),
      identifyingCharacteristics: identifyingCharacteristics || [],
      images,
      reportedBy: req.user.userId,
      reward: reward || { isOffered: false, amount: 0, description: '' },
      tags: tags || []
    });

    const savedItem = await newItem.save();

    // Update user's reportedItems
    await User.findByIdAndUpdate(
      req.user.userId,
      { $push: { reportedItems: savedItem._id } }
    );

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      item: savedItem
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create item',
      error: error.message
    });
  }
};

// Get all items with pagination and filtering
export const getAllItems = async (req, res) => {
  console.log('getAllItems function called');
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object based on query parameters
    const filter = {};
    
    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    
    // Location-based filtering
    if (req.query.location) {
      filter['location.name'] = { $regex: req.query.location, $options: 'i' };
    }
    
    // Date range filtering
    if (req.query.fromDate || req.query.toDate) {
      filter.dateLostOrFound = {};
      if (req.query.fromDate) filter.dateLostOrFound.$gte = new Date(req.query.fromDate);
      if (req.query.toDate) filter.dateLostOrFound.$lte = new Date(req.query.toDate);
    }

    // If user ID is provided, filter by user
    if (req.query.userId) {
      filter.reportedBy = req.query.userId;
    }

    const items = await Item.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reportedBy', 'name email avatar averageRating');

    const totalItems = await Item.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages,
      totalItems,
      items
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch items',
      error: error.message
    });
  }
};

// Search items by keywords, category, location, etc.
export const searchItems = async (req, res) => {
  try {
    console.log('Received search query:', req.query);
    const { query, category, type, location, sortBy } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build the search filter
    const searchFilter = {};
    
    // Text search if query is provided
    if (query && query.trim() !== '') {
      searchFilter.$text = { $search: query };
    }
    
    // Category filter
    if (category && category.trim() !== '') {
      searchFilter.category = category;
    }
    
    // Location filter - case insensitive partial match
    if (location) {
      console.log('Location:', location);
      searchFilter['location.name'] = { $regex: location, $options: 'i' };
    }
    
    // Type filter (lost/found)
    if (type && type.trim() !== '') {
      searchFilter.type = type;
    }

    // Only show active items by default
    if (!req.query.status) {
      searchFilter.status = 'active';
    } else {
      searchFilter.status = req.query.status;
    }

    // Sort options
    let sortOptions = { createdAt: -1 }; // Default: newest first
    if (sortBy === 'oldest') sortOptions = { createdAt: 1 };
    else if (sortBy === 'relevance' && query) sortOptions = { score: { $meta: 'textScore' } };

    // Execute search
    let searchQuery = Item.find(searchFilter);
    
    // Add text score projection if searching by text
    if (query && query.trim() !== '') {
      searchQuery = searchQuery.select({ score: { $meta: 'textScore' } });
    }

    const items = await searchQuery
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('reportedBy', 'name email avatar averageRating');

    const totalItems = await Item.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages,
      totalItems,
      items
    });
  } catch (error) {
    console.error('Error searching items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search items',
      error: error.message
    });
  }
};

// Get item by ID
export const getItemById = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // Validate objectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format'
      });
    }

    const item = await Item.findById(itemId)
      .populate('reportedBy', 'name email avatar averageRating')
      .populate({
        path: 'claims',
        select: 'status claimant createdAt',
        populate: {
          path: 'claimant',
          select: 'name avatar averageRating'
        }
      });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      item
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch item',
      error: error.message
    });
  }
};

// Update item
export const updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    
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

    // Check if user is the owner of the item
    if (!isItemOwner(item, req.user.userId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this item'
      });
    }

    // Parse the JSON data if it's sent as a string
    let itemData = req.body;
    if (req.body.data) {
      itemData = JSON.parse(req.body.data);
    }

    // Update allowed fields
    const allowedUpdates = [
      'title', 
      'description', 
      'category', 
      'location', 
      'identifyingCharacteristics', 
      'reward',
      'tags'
    ];
    
    // Copy only allowed fields from request body
    const updateData = {};
    for (const field of allowedUpdates) {
      if (itemData[field] !== undefined) {
        updateData[field] = itemData[field];
      }
    }

    // Process uploaded images
    if (req.files && req.files.length > 0) {
      // Create array of file paths
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      
      // If keepExistingImages flag is set in the request, append to existing images
      if (itemData.keepExistingImages) {
        updateData.images = [...item.images, ...newImages];
      } else {
        // Otherwise replace existing images
        updateData.images = newImages;
      }
    } else if (itemData.images) {
      // If no new files but images field is provided in the request
      updateData.images = itemData.images;
    }

    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('reportedBy', 'name email avatar averageRating');

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update item',
      error: error.message
    });
  }
};

// Delete item
export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    
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

    // Check if user is the owner of the item or an admin
    if (!isItemOwner(item, req.user.userId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this item'
      });
    }

    // Delete the item
    await Item.findByIdAndDelete(itemId);
    
    // Remove item from user's reportedItems array
    await User.findByIdAndUpdate(
      item.reportedBy,
      { $pull: { reportedItems: itemId } }
    );

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete item',
      error: error.message
    });
  }
};

// Update item status (admin only, handled by middleware)
export const updateItemStatus = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;
    
    // Validate objectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format'
      });
    }

    // Validate status
    const validStatuses = ['active', 'claimed', 'resolved', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    // Get item with populated reportedBy and followers
    const item = await Item.findById(itemId)
      .populate('reportedBy', 'name email')
      .populate('followers.user', 'name email');
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      { $set: { status } },
      { new: true }
    );

    // Status change message for email
    const statusMessage = `Your item "${item.title}" status has been changed to ${status}.`;
    
    // Send email to item owner
    if (item.reportedBy && item.reportedBy.email) {
      await sendEmail(
        item.reportedBy.email,
        `Khuje Dei: Item Status Update - ${item.title}`,
        `Hello ${item.reportedBy.name},\n\n${statusMessage}\n\nItem details:\nTitle: ${item.title}\nCategory: ${item.category}\nType: ${item.type}\nCurrent Status: ${status}\n\nThank you for using Khuje Dei!`
      );
    }

    // Send emails to followers
    if (item.followers && item.followers.length > 0) {
      for (const follower of item.followers) {
        // Skip if the follower is the same as the item owner
        if (follower.user && 
            item.reportedBy && 
            follower.user._id.toString() === item.reportedBy._id.toString()) {
          continue;
        }
        console.log(follower.user);
        
        // Send email to follower if they have an email
        if (follower.user && follower.user.email) {
          const followerMessage = `An item you're following "${item.title}" has had its status changed to ${status}.`;
          
          await sendEmail(
            follower.user.email,
            `Khuje Dei: Followed Item Update - ${item.title}`,
            `Hello ${follower.user.name},\n\n${followerMessage}\n\nItem details:\nTitle: ${item.title}\nCategory: ${item.category}\nType: ${item.type}\nCurrent Status: ${status}\n\nThank you for using Khuje Dei!`
          );
        }
      }
    }

    console.log(item);

    res.status(200).json({
      success: true,
      message: 'Item status updated successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error('Error updating item status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update item status',
      error: error.message
    });
  }
};

// Follow an item to receive notifications
export const followItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.userId;
    
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

    // Check if user is already following this item
    const isFollowing = item.followers.some(
      follower => follower.user && follower.user.toString() === userId
    );

    if (isFollowing) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this item'
      });
    }

    // Add user to item followers
    item.followers.push({ 
      user: userId,
      addedAt: new Date()
    });
    
    await item.save();

    // Add item to user's followingItems
    await User.findByIdAndUpdate(
      userId,
      { 
        $push: { 
          followingItems: { 
            item: itemId,
            addedAt: new Date() 
          } 
        } 
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Item followed successfully'
    });
  } catch (error) {
    console.error('Error following item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to follow item',
      error: error.message
    });
  }
};

// Unfollow an item
export const unfollowItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.userId;
    
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

    // Check if user is following this item
    const isFollowing = item.followers.some(
      follower => follower.user && follower.user.toString() === userId
    );

    if (!isFollowing) {
      return res.status(400).json({
        success: false,
        message: 'You are not following this item'
      });
    }

    // Remove user from item followers
    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      { $pull: { followers: { user: userId } } },
      { new: true }
    );

    // Remove item from user's followingItems
    await User.findByIdAndUpdate(
      userId,
      { $pull: { followingItems: { item: itemId } } }
    );

    res.status(200).json({
      success: true,
      message: 'Item unfollowed successfully',
      followers: updatedItem.followers
    });
  } catch (error) {
    console.error('Error unfollowing item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unfollow item',
      error: error.message
    });
  }
};