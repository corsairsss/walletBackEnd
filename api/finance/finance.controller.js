const Joi = require('joi');
const { ObjectId } = require('mongodb');
const financeModel = require('./finance.model.js');
const { UnauthorizedError } = require('../helpers/error.js');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const date = require('date-and-time');
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

    //change balance
    if (type === '+' && allPositive.length > 0) {
      const { balance } = allPositive[allPositive.length - 1];
      req.body.balance = balance + amount;
      allPositive[allPositive.length - 1].balance = balance + amount;
    } else if (type === '-' && allNegative.length > 0) {
      const { balance } = allNegative[allNegative.length - 1];
      req.body.balance = balance + amount;
      allNegative[allNegative.length - 1].balance = balance + amount;
    } else req.body.balance = amount;

    //change ballance загальний
    let costs;
    let inCome;
    if (allNegative.length === 0) {
      costs = 0;
    } else costs = allNegative[allNegative.length - 1].balance;

    if (allPositive.length === 0) {
      inCome = 0;
    } else inCome = allPositive[allPositive.length - 1].balance;
    const balance = inCome - costs;

    //transform date
    const reqDate = req.body.date;
    const month = date.transform(reqDate, 'YYYY-MM-DD', 'MMMM');
    const year = date.transform(reqDate, 'YYYY-MM-DD', 'YYYY');

    //add to req.body
    req.body.globalBalance = balance;
    req.body.month = month;
    req.body.year = year;
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

async function getStats(req, res, next) {
  try {
    const allCosts = await financeModel.find({
      type: '-',
      userId: req.userId,
    });

    const allInCome = await financeModel.find({
      type: '+',
      userId: req.userId,
    });

    console.log(allCosts);
    let costs;
    let inCome;
    if (allCosts.length === 0) {
      costs = 0;
    } else costs = allCosts[allCosts.length - 1].balance;

    if (allInCome.length === 0) {
      inCome = 0;
    } else inCome = allInCome[allInCome.length - 1].balance;
    const balance = inCome - costs;

    const food = getStatsPercentage(allCosts, 'food');
    const car = getStatsPercentage(allCosts, 'car');
    const SelfCare = getStatsPercentage(allCosts, 'Self care');
    const ChildCare = getStatsPercentage(allCosts, 'Child care');
    const House = getStatsPercentage(allCosts, 'House');
    const Education = getStatsPercentage(allCosts, 'Education');
    const Enterteinment = getStatsPercentage(allCosts, 'Enterteinment');
    const other = getStatsPercentage(allCosts, 'Others');

    const response = {
      costs,
      inCome,
      balance,
      stats: {
        food,
        car,
        SelfCare,
        ChildCare,
        House,
        Education,
        Enterteinment,
        other,
      },
    };

    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

function getStatsPercentage(allCosts, category) {
  const arrayOneCategory = allCosts.filter(item => item.category === category); //allCosts -це маисив з type "-", фільтруємо по категорії н.п. food
  if (arrayOneCategory.length === 0) return null; // вертаємо null якщо по категорії нема транзакцій
  const mapped = arrayOneCategory.map(item => item.amount); // масив типу[100,10,50,122] по цій транзакції
  const resReduce = mapped.reduce((acc, item) => acc + item); // сума масиву
  return resReduce;
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

async function getKurs(req, res, next) {
  try {
    const day = date.format(new Date(), 'DD', true);
    const month = date.format(new Date(), 'MM', true);
    const year = date.format(new Date(), 'YYYY', true);

    const dates = `${day}.${month}.${year}`;
    const apiPrivat = `https://api.privatbank.ua/p24api/exchange_rates?json&date=${dates}`;
    const response = await axios.get(apiPrivat);
    const { exchangeRate } = response.data;

    const eur = exchangeRate.find(item => item.currency === 'EUR');
    const usd = exchangeRate.find(item => item.currency === 'USD');
    const rub = exchangeRate.find(item => item.currency === 'RUB');
    const currency = [];
    currency.push(usd);
    currency.push(eur);
    currency.push(rub);

    return res.status(200).json(currency);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addTr,
  getData,
  authorize,
  getKurs,
  getStats,
};
