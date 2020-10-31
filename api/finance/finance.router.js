const express = require('express');

const { addTr, getData, authorize } = require('./finance.controller.js');

const userRouter = express.Router();

userRouter.post('/addOperation', authorize, addTr);
userRouter.get('/getdata', authorize, getData);

// userRouter.get('/', getContact);
// userRouter.get('/:id',validateId, getContactById);
// userRouter.delete('/:id',validateId, deleteContact);
// userRouter.put('/:id', validateChangeFieldContact, updateContact);

module.exports = userRouter;
