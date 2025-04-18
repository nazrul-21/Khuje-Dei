// controllers/notification.js
import Notification from '../models/notification.js';
import mongoose from 'mongoose';

// Helper function to create notifications
export const createNotification = async (notificationData) => {
  try {
    const notification = new Notification({
      recipient: notificationData.recipient,
      type: notificationData.type,
      message: notificationData.message,
      item: notificationData.item || null,
      claim: notificationData.claim || null,
      sender: notificationData.sender || null
    });

    return await notification.save();
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Get user's notifications with pagination
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get filter parameters from query
    const { read } = req.query;
    
    // Build filter
    const filter = { recipient: userId };
    
    // Filter by read status if specified
    if (read === 'true') {
      filter.read = true;
    } else if (read === 'false') {
      filter.read = false;
    }

    const notifications = await Notification.find(filter)
      .populate('item', 'title type')
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalNotifications = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false
    });

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalNotifications / limit),
      totalNotifications,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    // Validate objectId
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID format'
      });
    }

    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user is the recipient
    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to mark this notification as read'
      });
    }

    if (notification.read) {
      return res.status(200).json({
        success: true,
        message: 'Notification is already marked as read'
      });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};