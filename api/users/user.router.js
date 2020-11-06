const express = require('express');

const {
  getUsers,
  getUserById,
  deleteUser,
  addNewUser,
  validateCreateUser,
  validateId,
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

// userRouter.get('/', getUsers);
// userRouter.get('/current', authorize, getCurrentUser);
// userRouter.get('/:id', validateId, getUserById);

module.exports = userRouter;
