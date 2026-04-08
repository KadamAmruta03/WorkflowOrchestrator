const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Person = require('../models/Person');

// Minimal auth for this project (no JWT yet).
// Session is handled on the client via localStorage.

// Admin: no account creation. Fixed password "admin123" opens the admin panel.
router.post('/admin/login', async (req, res) => {
  try {
    const { password } = req.body || {};
    if (!password) return res.status(400).json({ message: 'Password is required.' });
    if (password !== 'admin123') return res.status(401).json({ message: 'Invalid admin password.' });

    // Ensure an Admin user exists in the DB so the rest of the system can treat Admin like a normal user (chat, etc.)
    let adminUser = await User.findOne({ role: 'Admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin',
        email: 'admin@company.local',
        password: 'admin123',
        role: 'Admin',
        employeeId: 'ADMIN'
      });
    }

    return res.json({
      user: { id: String(adminUser._id), name: adminUser.name, email: adminUser.email, role: 'Admin' }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed.', error: err.message });
  }
});

// Employee: sign in using employeeId + password.
router.post('/employee/login', async (req, res) => {
  try {
    const { employeeId, password } = req.body || {};
    if (!employeeId || !password) {
      return res.status(400).json({ message: 'Employee ID and password are required.' });
    }

    const person = await Person.findOne({ employeeId, role: 'Employee' });
    if (!person) {
      return res.status(403).json({ message: 'Password not set for this Employee ID. Use Set Password once.' });
    }
    if (person.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    if (!person.userId) {
      return res.status(500).json({ message: 'Employee account is not linked. Contact admin.' });
    }

    const user = await User.findById(person.userId);
    return res.json({
      user: {
        id: String(person.userId),
        name: user?.name || person.name,
        email: user?.email || person.email,
        role: 'Employee'
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed.', error: err.message });
  }
});

// Employee: set password ONCE using employeeId.
router.post('/employee/set-password', async (req, res) => {
  try {
    const { employeeId, password } = req.body || {};
    if (!employeeId || !password) {
      return res.status(400).json({ message: 'Employee ID and password are required.' });
    }

    const user = await User.findOne({ employeeId, role: { $ne: 'Admin' } });
    if (!user) {
      return res.status(404).json({ message: 'Employee ID not found. Ask admin to onboard you first.' });
    }

    // If a person identity exists and already set a password, block changes.
    const existing = await Person.findOne({ employeeId, role: 'Employee' });
    if (existing?.passwordSetAt) {
      return res.status(409).json({ message: 'Password already set for this Employee ID. You cannot change it.' });
    }

    let person = existing;
    if (!person) {
      person = await Person.create({
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        password,
        role: 'Employee',
        userId: user._id,
        passwordSetAt: new Date()
      });
    } else {
      person.password = password;
      person.userId = user._id;
      person.name = user.name;
      person.email = user.email;
      person.passwordSetAt = new Date();
      await person.save();
    }

    // Keep User password aligned (some parts of the app already save/read it).
    user.password = password;
    await user.save();

    return res.status(201).json({
      user: { id: String(user._id), name: user.name, email: user.email, role: 'Employee' }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Set password failed.', error: err.message });
  }
});

module.exports = router;
