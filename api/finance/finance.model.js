const mongoose = require('mongoose');
const { Schema } = mongoose;

const financeSchema = new Schema({
  date: { type: String, required: true },
  type: { type: String, required: true },
  category: { type: String, required: false, default: null },
  comments: { type: String, required: false },
  amount: { type: Number, required: true },
  balance: { type: Number, required: false, default: 0 },
  month: { type: String },
  year: { type: String },
  userId: { type: String, required: false },
});

const financeModel = mongoose.model('Finance', financeSchema);

module.exports = financeModel;
