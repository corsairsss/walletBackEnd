const mongoose = require('mongoose');
const { Schema } = mongoose;

const financeSchema = new Schema({
  date: { type: Number, required: true },
  type: { type: String, required: true },
  category: { type: String, required: false, default: null },
  comments: { type: String, required: false },
  amount: { type: Number, required: true },
  balance: { type: Number, required: false, default: 0 },
});

// financeSchema.statics.findUserByIdAndUpdate = findUserByIdAndUpdate;

// async function findUserByIdAndUpdate(contactId, updateParams) {
//   return this.findByIdAndUpdate(
//     contactId,
//     {
//       $set: updateParams,
//     },
//     {
//       new: true,
//     },
//   );
// }

const financeModel = mongoose.model('Finance', financeSchema);

module.exports = financeModel;
