const Joi = require('joi');
const { ObjectId } = require('mongodb');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { UnauthorizedError } = require('../helpers/error.js');
const usersModel = require('./user.model.js');

const timeLivingToken = 2592000000;

async function getCurrentUser(req, res, next) {
  try {
    console.log(req.user);
    const filtredUsers = getSomeField([req.user]);

    return res.status(200).json(filtredUsers[0]);
  } catch (err) {
    next(err);
  }
}

async function addNewUser(req, res, next) {
  try {
    const { email, password, name } = req.body;

    const passwordHash = await bcryptjs.hash(password, 4);

    const isEmailExist = await usersModel.findUserByEmail(email);

    if (isEmailExist)
      return res.status(409).json({ message: 'Authentication failed' });

    const user = await usersModel.create({
      email,
      password: passwordHash,
      name,
    });
    const token = await checkUser(email, password);
    return res
      .status(201)
      .json({ token, user: { email: user.email, name: user.name } });
  } catch (err) {
    next(err);
  }
}

async function checkUser(email, password) {
  const user = await usersModel.findUserByEmail(email);
  if (!user) {
    throw new UnauthorizedError('Authentication failed');
  }

  const isPasswordValid = await bcryptjs.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Authentication failed');
  }

  const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: timeLivingToken,
  });
  await usersModel.updateToken(user._id, token);

  return token;
}

async function signIn(req, res, next) {
  try {
    const { email, password } = req.body;
    const token = await checkUser(email, password);
    const userId = await jwt.verify(token, process.env.JWT_SECRET).id;

    const user = await usersModel.findOne({ _id: userId });
    if (user.verificationToken)
      return res.status(404).json({ mesage: 'User not Found' });
    return res.status(200).json({ token, user: { email, name: user.name } });
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

    const user = await usersModel.findById(userId);
    if (!user || user.token !== token) {
      throw new UnauthorizedError('User not authorized');
    }

    req.user = user;
    req.token = token;

    next();
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const user = req.user;
    await usersModel.updateToken(user._id, null);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

function validateCreateUser(req, res, next) {
  const createUserRules = Joi.object({
    email: Joi.string().required(),
    name: Joi.string().required(),
    password: Joi.string().required(),
    passwordConfirm: Joi.string().required(),
    token: Joi.string(),
  });
  const result = createUserRules.validate(req.body);
  if (result.error)
    return res.status(400).send({ message: 'missing required name field' });

  next();
}

function validateSignIn(req, res, next) {
  const signInRules = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });

  const validationResult = signInRules.validate(req.body);
  if (validationResult.error) {
    return res.status(400).send(validationResult.error);
  }

  next();
}

function getSomeField(users) {
  const filterUsers = users.map(user => ({
    email: user.email,
    id: user._id,
    name: user.name,
  }));

  return filterUsers;
}

module.exports = {
  addNewUser,
  validateCreateUser,
  signIn,
  validateSignIn,
  authorize,
  logout,
  getCurrentUser,
};
