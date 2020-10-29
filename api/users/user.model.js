const { string } = require('joi');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  passwordConfirm: { type: String },

  // avatarURL: { type: String, required: false },
  // subscription: {
  //   type: String,
  //   enum: ['free', 'pro', 'premium'],
  //   default: 'free',
  //   required: false,
  // },
  token: { type: String, required: false },
  verificationToken: { type: String, required: false },
});

userSchema.statics.findUserByIdAndUpdate = findUserByIdAndUpdate;
userSchema.statics.findUserByEmail = findUserByEmail;
userSchema.statics.updateToken = updateToken;
userSchema.statics.createVerificationToken = createVerificationToken;

async function findUserByIdAndUpdate(contactId, updateParams) {
  return this.findByIdAndUpdate(
    contactId,
    {
      $set: updateParams,
    },
    {
      new: true,
    },
  );
}

async function findUserByEmail(email) {
  return this.findOne({ email });
}

async function updateToken(id, newToken) {
  return this.findByIdAndUpdate(id, {
    token: newToken,
  });
}

async function createVerificationToken(userId, verificationToken) {
  return this.findByIdAndUpdate(
    userId,
    {
      verificationToken,
    },
    {
      new: true,
    },
  );
}

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
