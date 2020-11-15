const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const whiteList = require('./constants/whiteList.js');

require('dotenv').config();

const financeRouter = require('./finance/finance.router');
const userRouter = require('./users/user.router');

mongoose.set('debug', true);

module.exports = class WalletServer {
  constructor() {
    this.server = null;
  }

  async start() {
    this.initServer();
    this.initMiddlewares();
    this.initRoutes();
    await this.initDatabase();
    return this.startListening();
  }

  initServer() {
    this.server = express();
  }
  initMiddlewares() {
    this.server.use(express.json());
    this.server.use(express.urlencoded());

    // const whitelist = [
    //   'http://localhost:3000',
    //   'https://final-team-project-wallet.netlify.app',
    //   'https://bmm-wallet.netlify.app',
    // ];
    // console.log(whiteList);

    const corsOptions = {
      origin: function (origin, callback) {
        if (whiteList.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
    };
    // this.server.use(cors({ origin: 'http://localhost:3000' }));

    this.server.use(cors(corsOptions));
  }

  initRoutes() {
    this.server.use('/finance', financeRouter);
    this.server.use('/users', userRouter);
  }

  async initDatabase() {
    await mongoose.connect(process.env.MONGODB_URL);
  }

  startListening() {
    try {
      return this.server.listen(process.env.PORT, () => {
        console.log('Database connection successful', process.env.PORT);
      });
    } catch (err) {
      console.log('error', err);
      process.exit(1);
    }
  }
};
