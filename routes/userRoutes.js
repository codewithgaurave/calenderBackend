const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig');

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
// Simple forget password route
router.put('/forgot-password', userController.forgotPassword);

// Protected routes
router.get('/profile', protect, userController.getUserProfile);
router.put('/profile', protect, userController.updateUserProfile);

// Image upload routes
router.put('/profile/image', 
  protect, 
  upload.single('profileImage'), 
  userController.updateUserProfileImage
);

router.delete('/profile/image', protect, userController.deleteUserProfileImage);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed!'
    });
  }
  
  res.status(500).json({
    success: false,
    message: error.message
  });
});

module.exports = router;