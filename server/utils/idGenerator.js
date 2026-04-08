const Counter = require('../models/Counter');

async function nextSequence(key) {
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
}

async function generateEmployeeId() {
  const seq = await nextSequence('employeeId');
  const num = 10000 + seq;
  return `EMP-${num}`;
}

module.exports = { nextSequence, generateEmployeeId };

