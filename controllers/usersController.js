const User = require('../model/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const sharp = require('sharp');
const factory = require('./handleFactory');
const multer = require('multer');
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else {
    cb(new AppError('Not an image please upload only images', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  console.log('hello');
  req.file.filename = `user-${req.currentUser._id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});
exports.uploadPhotoUser = upload.single('photo');
const filterObject = (obj, ...allowedFields) => {
  const newObj = {};
  for (let key of Object.keys(obj)) {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
};
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    throw new AppError('this route not for updating password', 400);
  }
  const filterBody = filterObject(req.body, 'name', 'email');
  if (req.file) {
    filterBody.photo = req.file.filename;
  }

  const user = await User.findByIdAndUpdate(req.currentUser._id, filterBody, {
    new: true,
  });
  res.status(200).json({
    status: 'success',
    newUser: user,
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.currentUser._id, {
    active: false,
  });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.getAllUsers = factory.getAll(User);
exports.getMe = (req, res, next) => {
  req.params.id = req.currentUser._id;
  next();
};
exports.getUser = factory.getOne(User);
exports.createUser = (req, res) => {
  res.status(201).json({
    status: 'success',
    data: 'nothing',
  });
};
exports.updateUser = (req, res) => {
  res.status(201).json({
    status: 'success',
    data: 'updated tour',
  });
};
exports.deleteUser = factory.deleteOne(User);
