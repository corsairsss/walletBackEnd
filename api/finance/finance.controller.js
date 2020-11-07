const Joi = require('joi');
const { ObjectId } = require('mongodb');
const financeModel = require('./finance.model.js');
const { UnauthorizedError } = require('../helpers/error.js');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const date = require('date-and-time');

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

    console.log('-----', req.body.type);
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

async function authorize(req, res, next) {
  try {
    const authorizationHeader = req.get('Authorization') || '';
    const token = authorizationHeader.replace('Bearer ', '');
    let userId;

    try {
      userId = await jwt.verify(token, process.env.JWT_SECRET).id;
    } catch (err) {
      next(new UnauthorizedError('User not authorized'));
    }

    req.userId = userId;

    next();
  } catch (err) {
    next(err);
  }
}

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
};
