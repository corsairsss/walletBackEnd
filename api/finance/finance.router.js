const express = require('express');

const {
  addTr,
  getData,
  authorize,
  getKurs,
  getStats
} = require('./finance.controller.js');

const userRouter = express.Router();

userRouter.post('/addOperation', authorize, addTr);
userRouter.get('/getdata', authorize, getData);
userRouter.get('/stats',authorize, getStats);
userRouter.get('/apiprivat', getKurs);

module.exports = userRouter;
