// routes/route.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

// Import controllers (these would need to be created)
import * as authController from '../controllers/auth.js';
import * as userController from '../controllers/user.js';
import * as adminController from '../controllers/admin.js';
import * as reportController from '../controllers/report.js';

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
  // res.status(200).json({ message: 'Update report status route' });
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

export default router;