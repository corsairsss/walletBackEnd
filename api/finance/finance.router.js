const express = require('express');

const { addTr, getData } = require('./finance.controller.js');

const userRouter = express.Router();

userRouter.post('/addOperation', addTr);
userRouter.get('/getdata', getData);

// userRouter.get('/', getContact);
// userRouter.get('/:id',validateId, getContactById);
// userRouter.delete('/:id',validateId, deleteContact);
// userRouter.put('/:id', validateChangeFieldContact, updateContact);

module.exports = userRouter;
