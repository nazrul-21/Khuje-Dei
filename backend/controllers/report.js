import Report from '../models/report.js';
import User from '../models/user.js';

// Report user
export const reportUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, description } = req.body;
    
    // Check if reported user exists
    const reportedUser = await User.findById(userId);
    if (!reportedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-reporting
    if (userId === req.user.userId) {
      return res.status(400).json({ message: 'Cannot report yourself' });
    }

    // Create report
    const report = new Report({
      reportedUser: userId,
      reportedBy: req.user.userId,
      reason,
      description,
      status: 'pending'
    });

    await report.save();

    res.status(201).json({
      message: 'Report submitted successfully',
      report: {
        id: report._id,
        reason: report.reason,
        status: report.status,
        createdAt: report.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get my reports
export const getMyReports = async (req, res) => {
  console.log('getMyReports function called');
  try {
    const reports = await Report.find({ reportedBy: req.user.userId })
      .populate('reportedUser', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};