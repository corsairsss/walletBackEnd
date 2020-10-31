const Joi = require('joi');
const { ObjectId } = require('mongodb');
const financeModel = require('./finance.model.js');
const { UnauthorizedError } = require('../helpers/error.js');
const jwt = require('jsonwebtoken');

// async function getContact(req, res, next) {
//   try {
//     const contacts = await contactsModel.find();
//     return res.status(200).json(contacts);
//   } catch (err) {
//     next(err);
//   }
// }

// async function getContactById(req, res, next) {
//   try {
//     const contactId = req.params.id;
//     const contact = await contactsModel.findOne({ _id: contactId });
//     !contact ? res.status(404).send() : res.status(200).json(contact);
//   } catch (err) {
//     next(err);
//   }
// }

// async function deleteContact(req, res, next) {
//   try {
//     const contactId = req.params.id;
//     const contact = await contactsModel.findByIdAndDelete({ _id: contactId });
//     !contact ? res.status(404).send() : res.status(200).json();
//   } catch (err) {
//     next();
//   }
// }
async function addTr(req, res, next) {
  try {
    const { type } = req.body;
    const amount = +req.body.amount;
    const allPositive = await financeModel.find({
      type: '+',
      userId: req.userId,
    });
    const allNegative = await financeModel.find({
      type: '-',
      userId: req.userId,
    });

    if (type === '+' && allPositive.length > 0) {
      const { balance } = allPositive[allPositive.length - 1];
      req.body.balance = balance + amount;
    } else if (type === '-' && allNegative.length > 0) {
      const { balance } = allNegative[allNegative.length - 1];
      req.body.balance = balance + amount;
    } else req.body.balance = amount;
    req.body.userId = req.userId;
    const tr = await financeModel.create(req.body);
    return res.status(201).json(tr);
  } catch (err) {
    next(err);
  }
}
async function getData(req, res, next) {
  try {
    const allTransaction = await financeModel.find({ userId: req.userId });
    console.log(allTransaction);
    return res.status(200).json(allTransaction);
  } catch (err) {
    next(err);
  }
}
async function authorize(req, res, next) {
  try {
    // 1. витягнути токен користувача з заголовка Authorization
    const authorizationHeader = req.get('Authorization') || '';
    const token = authorizationHeader.replace('Bearer ', '');
    // console.log('--------------', token);
    // 2. витягнути id користувача з пейлоада або вернути користувачу
    // помилку зі статус кодом 401
    let userId;

    try {
      userId = await jwt.verify(token, process.env.JWT_SECRET).id;
      // userId = await jwt.verify(token, process.env.JWT_SECRET).id;
    } catch (err) {
      next(new UnauthorizedError('User not authorized'));
    }
    // console.log('+++++++++++++', userId);
    // 3. витягнути відповідного користувача. Якщо такого немає - викинути
    // помилку зі статус кодом 401
    // userModel - модель користувача в нашій системі
    // const user = await usersModel.findById(userId);

    // if (!user || user.token !== token) {
    //   throw new UnauthorizedError('User not authorized');
    // }

    // 4. Якщо все пройшло успішно - передати запис користувача і токен в req
    // і передати обробку запиту на наступний middleware
    req.userId = userId;
    // req.token = token;

    next();
  } catch (err) {
    next(err);
  }
}

// async function updateContact(req, res, next) {
//   try {
//     const contactId = req.params.id;

//     const contactToUpdate = await contactsModel.findUserByIdAndUpdate(
//       contactId,
//       req.body,
//     );
//     if (!contactToUpdate) {
//       return res.status(404).send();
//     }

//     return res.status(200).send(contactToUpdate);
//   } catch (err) {
//     next(err);
//   }
// }

// function validateCreateContact(req, res, next) {
//   const createUserRules = Joi.object({
//     name: Joi.string().required(),
//     email: Joi.string().required(),
//     phone: Joi.string().required(),
//     subscription: Joi.string().required(),
//     password: Joi.string().required(),
//     token: Joi.string().required(),
//   });
//   const result = createUserRules.validate(req.body);
//   if (result.error)
//     return res.status(400).send({ message: 'missing required name field' });

//   next();
// }

// function validateChangeFieldContact(req, res, next) {
//   const createUserRules = Joi.object({
//     name: Joi.string(),
//     email: Joi.string(),
//     phone: Joi.string(),
//     subscription: Joi.string(),
//     password: Joi.string(),
//     token: Joi.string(),
//   });
//   const result = createUserRules.validate(req.body);
//   if (result.error)
//     return res.status(400).send({ message: 'missing required name field' });

//   next();
// }

// function validateId(req, res, next) {
//   const { id } = req.params;

//   if (!ObjectId.isValid(id)) {
//     return res.status(400).send();
//   }

//   next();
// }

module.exports = {
  addTr,
  getData,
  authorize,
};
