const express = require('express');

const {
  addTr,
  getData,
  authorize,
  getKurs,
} = require('./finance.controller.js');

const userRouter = express.Router();

userRouter.post('/addOperation', authorize, addTr);
userRouter.get('/getdata', authorize, getData);
userRouter.get('/apiprivat', getKurs);

module.exports = userRouter;
