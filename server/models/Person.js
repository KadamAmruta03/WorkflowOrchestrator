const mongoose = require('mongoose');

// Auth identities live in this collection.
// Mongoose pluralizes "Person" -> "people" (collection name the user requested).
const personSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    // Employees sign in with employeeId (not email/name).
    // Sparse keeps old docs (if any) from breaking unique index when missing.
    employeeId: { type: String, unique: true, sparse: true },

    password: { type: String, required: true }, // NOTE: currently plain text; hash later.
    role: { type: String, enum: ['Admin', 'Employee'], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // for Employee

    // Employees can set password only once.
    passwordSetAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Person', personSchema);
