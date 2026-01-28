const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'user must have name'],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, 'User must have email'],
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    default: 'user',
    enum: {
      values: ['user', 'guide', 'lead-guide', 'admin'],
      message: 'role must be one of theese user, guide, lead-guide, admin ',
    },
  },
  password: {
    type: String,
    required: [true, 'User must have password'],
    minLength: [8, 'password must be 8  characters or more'],
    select: false,
  },
  // passwordConfirm: {
  //   type: String,
  //   required: [true, 'User must confirm his password'],
  //   validate: {
  //     validator: function (val) {
  //       return val === this.password;
  //     },
  //     message: 'password and passwordConfirm must match',
  //   },
  // },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
userSchema.pre('save', function () {
  if (!this.isModified('password') || this.isNew) {
    this.passwordChangedAt = Date.now() - 2000;
  }
});
userSchema.pre(/^find/, function () {
  this.find({ active: { $ne: false } });
});
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});
userSchema.methods.correctPassword = async function (
  inputPassword,
  databasePassword,
) {
  return await bcrypt.compare(inputPassword, databasePassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime();
    console.log(JWTTimeStamp + ' jwt');
    console.log(changedTimestamp + ' database');
    console.log(changedTimestamp > JWTTimeStamp);
    return changedTimestamp > JWTTimeStamp * 1000;
  }
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
