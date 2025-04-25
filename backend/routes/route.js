// routes/route.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';
import { upload, uploadSingleImage, uploadMultipleImages, deleteImage } from '../controllers/media.js';

const router = express.Router();

// Import controllers (these would need to be created)
import * as authController from '../controllers/auth.js';
import * as userController from '../controllers/user.js';
import * as adminController from '../controllers/admin.js';
import * as reportController from '../controllers/report.js';
import * as itemController from '../controllers/item.js';
import * as claimController from '../controllers/claim.js';
import * as volunteerController from '../controllers/volunteer.js';
import * as botChatController from '../controllers/chat.js';


// Authentication routes
router.post('/auth/register', (req, res) => {
  authController.register(req, res);
  // res.status(200).json({ message: 'Register route' });
});

router.post('/auth/login', (req, res) => {
  authController.login(req, res);
  // res.status(200).json({ message: 'Login route' });
});

router.post('/auth/verify-email', (req, res) => {
  authController.verifyEmail(req, res);
  // res.status(200).json({ message: 'Verify email route' });
});

router.post('/auth/forgot-password', (req, res) => {
  authController.forgotPassword(req, res);
  // res.status(200).json({ message: 'Forgot password route' });
});

router.post('/auth/reset-password', (req, res) => {
  authController.resetPassword(req, res);
  // res.status(200).json({ message: 'Reset password route' });
});

router.post('/auth/logout', auth, (req, res) => {
  authController.logout(req, res);
  // res.status(200).json({ message: 'Logout route' });
});

router.post('/auth/refresh-token', (req, res) => {
  authController.refreshToken(req, res);
  // res.status(200).json({ message: 'Refresh token route' });
});

router.post('/auth/resend-verification', (req, res) => {
  authController.resendVerificationEmail(req, res);
});

// User routes
router.get('/users/profile', auth, (req, res) => {
  userController.getProfile(req, res);
  // res.status(200).json({ message: 'Get profile route' });
});

router.put('/users/profile', auth, (req, res) => {
  userController.updateProfile(req, res);
});

router.put('/users/change-password', auth, (req, res) => {
  userController.changePassword(req, res);
});


//invitation
router.post('/users/send-invitation', auth, (req, res) => {
  userController.sendInvitation(req, res);
});

router.get('/users/:userId/profile', (req, res) => {
  userController.getUserProfileById(req, res);
});


// Admin routes
router.get('/admin/users', auth, isAdmin, (req, res) => {
  adminController.getAllUsers(req, res);
  // res.status(200).json({ message: 'Get all users route' });
});

router.get('/admin/users/search', auth, isAdmin, (req, res) => {
  adminController.searchUsersByUsername(req, res);
  // res.status(200).json({ message: 'Search users by username route' });
});

router.post('/admin/users', auth, isAdmin, (req, res) => {
  adminController.addUser(req, res);
  // res.status(200).json({ message: 'Add user route' });
});

router.put('/admin/users/:userId/restrict', auth, isAdmin, (req, res) => {
  adminController.restrictUser(req, res);
  // res.status(200).json({ message: 'Restrict user route' });
});

router.put('/admin/users/:userId/activate', auth, isAdmin, (req, res) => {
  adminController.activateUser(req, res);
  // res.status(200).json({ message: 'Activate user route' });
});

router.get('/admin/reports', auth, isAdmin, (req, res) => {
  adminController.getAllReports(req, res);
  // res.status(200).json({ message: 'Get all reports route' });
});

router.put('/admin/reports/:reportId/status', auth, isAdmin, (req, res) => {
  adminController.updateReportStatus(req, res);
});
router.get('/admin/claims', auth, isAdmin, (req, res) => {
  adminController.getAllClaims(req, res);
});
router.get('/admin/items', auth, isAdmin, (req, res) => {
  adminController.getAllItems(req, res);
});

// Report routes
router.post('/reports/users/:userId', auth, (req, res) => {
  reportController.reportUser(req, res);
  // res.status(200).json({ message: 'Report user route' });
});

router.get('/reports/my-reports', auth, (req, res) => {
  reportController.getMyReports(req, res);
  // res.status(200).json({ message: 'Get my reports route' });
});

// Item routes
router.post('/items', auth, upload.array('images', 5), (req, res) => {
  itemController.createItem(req, res);
});

router.get('/items', (req, res) => {
  itemController.getAllItems(req, res);
});

router.get('/items/search', (req, res) => {
  itemController.searchItems(req, res);
});

router.get('/items/:itemId', (req, res) => {
  itemController.getItemById(req, res);
});

router.put('/items/:itemId', auth, (req, res) => {
  itemController.updateItem(req, res);
});

router.delete('/items/:itemId', auth, (req, res) => {
  itemController.deleteItem(req, res);
});

router.put('/items/:itemId/status', auth, isAdmin, (req, res) => {
  itemController.updateItemStatus(req, res);
});

router.post('/items/:itemId/follow', auth, (req, res) => {
  itemController.followItem(req, res);
});

router.delete('/items/:itemId/follow', auth, (req, res) => {
  itemController.unfollowItem(req, res);
});

// Claim routes
router.post('/items/:itemId/claims', auth, (req, res) => {
  claimController.createClaim(req, res);
});

router.get('/items/:itemId/claims', auth, (req, res) => {
  claimController.getItemClaims(req, res);
});

router.get('/claims/:claimId', auth, (req, res) => {
  claimController.getClaimById(req, res);
});

router.put('/claims/:claimId/status', auth, isAdmin, (req, res) => {
  claimController.updateClaimStatus(req, res);
});

router.get('/users/success-rate', auth, (req, res) => {
  userController.getUserSuccessRate(req, res);
});

// Notification routes
// router.get('/notifications', auth, (req, res) => {
//   notificationController.getUserNotifications(req, res);
// });

// router.put('/notifications/:notificationId/read', auth, (req, res) => {
//   notificationController.markNotificationAsRead(req, res);
// });

// router.put('/notifications/read-all', auth, (req, res) => {
//   notificationController.markAllNotificationsAsRead(req, res);
// });

// Rating routes
// router.post('/users/:userId/ratings', auth, (req, res) => {
//   ratingController.rateUser(req, res);
// });

// router.get('/users/:userId/ratings', (req, res) => {
//   ratingController.getUserRatings(req, res);
// });

// Upload single image
router.post('/upload', auth, upload.single('image'), uploadSingleImage);

// Upload multiple images
router.post('/upload-multiple', auth, upload.array('images', 5), uploadMultipleImages);

// Delete image
router.delete('/:filename', auth, deleteImage);



// Volunteer routes
router.get('/volunteers', (req, res) => {
  volunteerController.getAllVolunteers(req, res);
});



router.post('/volunteers/apply', auth, (req, res) => {
  volunteerController.applyForVolunteer(req, res);
});

router.get('/volunteers/my-status', auth, (req, res) => {
  volunteerController.getMyVolunteerStatus(req, res);
});

router.put('/volunteers/profile', auth, (req, res) => {
  volunteerController.updateVolunteerProfile(req, res);
});
router.get('/volunteers/:volunteerId', (req, res) => {
  volunteerController.getVolunteerById(req, res);
});

// Admin volunteer management routes
router.get('/admin/volunteers/applications', auth, isAdmin, (req, res) => {
  volunteerController.getVolunteerApplications(req, res);
});

router.put('/admin/volunteers/:volunteerId/approve', auth, isAdmin, (req, res) => {
  volunteerController.approveVolunteerApplication(req, res);
});

router.put('/admin/volunteers/:volunteerId/reject', auth, isAdmin, (req, res) => {
  volunteerController.rejectVolunteerApplication(req, res);
});

router.put('/admin/volunteers/:volunteerId/remove', auth, isAdmin, (req, res) => {
  volunteerController.removeVolunteerStatus(req, res);
});

router.put('/admin/volunteers/:volunteerId/promote', auth, isAdmin, (req, res) => {
  volunteerController.promoteVolunteer(req, res);
});

// Chat routes
router.get('/bot-chat', auth, (req, res) => {
  botChatController.getBotChat(req, res);
});

router.post('/bot-chat/message', auth, (req, res) => {
  botChatController.sendBotMessage(req, res);
});

router.post('/bot-chat/clear', auth, (req, res) => {
  botChatController.clearBotChat(req, res);
});

export default router;