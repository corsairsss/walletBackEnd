const Joi = require('joi');
const { ObjectId } = require('mongodb');
const financeModel = require('./finance.model.js');

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
    const allPositive = await financeModel.find({ type: '+' });
    const allNegative = await financeModel.find({ type: '-' });

    if (type === '+' && allPositive.length > 0) {
      const { balance } = allPositive[allPositive.length - 1];
      req.body.balance = balance + amount;
    } else if (type === '-' && allNegative.length > 0) {
      const { balance } = allNegative[allNegative.length - 1];
      req.body.balance = balance + amount;
    } else req.body.balance = amount;

    const tr = await financeModel.create(req.body);
    return res.status(201).json(tr);
  } catch (err) {
    next(err);
  }
}
async function getData(req, res, next) {
  try {
    const tr = await financeModel.find();
    const { balance } = tr[tr.length - 1];
    console.log(balance);
    return res.status(200).json(tr);
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
};
