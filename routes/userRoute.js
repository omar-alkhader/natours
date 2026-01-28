const express = require('express');
const multer = require('multer');
const userController = require('../controllers/usersController');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.use(authController.protect);
router
  .route('/me')
  .get(userController.getMe, userController.getUser)
  .patch(
    userController.uploadPhotoUser,
    userController.resizeUserPhoto,
    userController.updateMe,
  )
  .delete(userController.deleteMe);
router.patch('/updatePassword', authController.updatePassword);
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = router;
