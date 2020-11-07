const express = require('express');

const {
  addNewUser,
  validateCreateUser,
  validateSignIn,
  signIn,
  authorize,
  logout,
  getCurrentUser,
} = require('./user.controller.js');

const userRouter = express.Router();

userRouter.post('/signup', validateCreateUser, addNewUser);
userRouter.post('/signin', validateSignIn, signIn);
userRouter.post('/logout', authorize, logout);
userRouter.get('/current', authorize, getCurrentUser);

module.exports = userRouter;
