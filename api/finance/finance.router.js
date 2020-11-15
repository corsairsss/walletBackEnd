const express = require('express');

const {
  addTransaction,
  getData,
  getCurrency,
  authorize,
} = require('./finance.controller.js');

// const authorize = require('../users/user.controller.js');
const userRouter = express.Router();

userRouter.post('/addOperation', authorize, addTransaction);
userRouter.get('/getdata', authorize, getData);
userRouter.get('/apiprivat', getCurrency);

module.exports = userRouter;
