import User from '../models/user.js';
import Report from '../models/report.js';
import Item from '../models/item.js';
import bcrypt from 'bcryptjs';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search users by username
export const searchUsersByUsername = async (req, res) => {
  try {
    const { username } = req.query;
    
    if (!username) {
      return res.status(400).json({ message: 'Username query parameter is required' });
    }

    const users = await User.find({
      name: { $regex: username, $options: 'i' }
    }).select('-password');

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add user (by admin)
export const addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user (admin-created users are automatically verified)
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      isEmailVerified: true
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Restrict user
export const restrictUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent restricting self
    if (userId === req.user.userId) {
      return res.status(400).json({ message: 'Cannot restrict your own account' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent restricting other admins
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot restrict admin accounts' });
    }

    user.isActive = false;
    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({ message: 'User restricted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Activate user
export const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = true;
    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({ message: 'User activated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all reports
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedUser', 'name email')
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update report status
export const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find report
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status;
    report.updatedAt = Date.now();
    await report.save();

    res.status(200).json({
      message: 'Report status updated successfully',
      report
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllClaims = async (req, res) => {
  try {
    console.log("Inside getAllClaims");
    const { status } = req.query;
    let query = {};
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    const claims = await Claim.find(query)
      .populate('claimant', 'name email avatar')
      .populate({
        path: 'item',
        select: 'title type category status images',
        populate: {
          path: 'reportedBy',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      claims
    });
  } catch (error) {
    console.error('Error fetching all claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claims',
      error: error.message
    });
  }
};

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
      .populate('reportedBy', 'name email avatar averageRating')
      .populate({
        path: 'claims',
        model: 'Claim',
        populate: [
          {
            path: 'claimant',
            model: 'User',
            select: 'name email avatar'
          }
        ],
        select: 'status proofOfOwnership identifyingInformation createdAt meetupDetails'
      });

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