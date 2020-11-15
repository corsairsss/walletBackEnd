const express = require('express');

const {
  addTransaction,
  getData,
  authorize,
  getKurs,
} = require('./finance.controller.js');

const userRouter = express.Router();

userRouter.post('/addOperation', authorize, addTransaction);
userRouter.get('/getdata', authorize, getData);
userRouter.get('/apiprivat', getKurs);

module.exports = userRouter;
