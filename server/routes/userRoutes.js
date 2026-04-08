const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Person = require('../models/Person');
const Task = require('../models/Task');

// --- 1. GET TOTAL COUNT FOR AUTO-ID ---
// This enables the "EMP-10001" logic on the frontend
router.get('/count', async (req, res) => {
    try {
        // Count employees only (admins should not affect employee IDs).
        const count = await User.countDocuments({ role: { $ne: 'Admin' } });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ count: 0 });
    }
});

// --- 2. GET ALL EMPLOYEES ---
router.get('/', async (req, res) => {
    try {
        // Admins are not employees; keep the employee dataset clean for admin dashboard.
        const users = await User.find({ role: { $ne: 'Admin' } });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 2b. GET CHAT DIRECTORY (includes Admin) ---
// Used by in-app chat to allow employees to message HR/Admin.
router.get('/chat-directory', async (req, res) => {
    try {
        const users = await User.find().select('name role email employeeId').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 3. ADD NEW EMPLOYEE (POST) ---
router.post('/add', async (req, res) => {
    try {
        const newUser = new User({
            // Personal
            name: req.body.name,
            gender: req.body.gender,
            dob: req.body.dob,
            calculatedAge: req.body.calculatedAge,
            mobile: req.body.mobile,
            
            // Account
            email: req.body.email,
            // Employees will set their own password once using employeeId.
            // Keep a placeholder due to schema requirement.
            password: req.body.password || 'TEMP_PASSWORD',
            role: req.body.role || 'Employee',

            // Professional
            employeeId: req.body.employeeId,
            department: req.body.department,
            designation: req.body.designation,
            doj: req.body.doj,
            skills: req.body.skills,

            // New Status Fields (Matching your Schema)
            employeeType: req.body.employeeType || 'Undefined',
            recruitmentStatus: req.body.recruitmentStatus || 'Applied',

            // Tracking Defaults
            workloadScore: 0,
            xp: 0,
            attendanceStatus: 'Present'
        });

        await newUser.save();

        // We intentionally do NOT create a login password here anymore.
        // Employee must set password exactly once via /api/auth/employee/set-password.

        res.status(201).json(newUser);
    } catch (err) {
        console.error("Onboarding Error:", err.message);
        res.status(400).json({ 
            message: "Failed to add employee. Email or ID might already exist.",
            error: err.message 
        });
    }
});

// --- 4. DELETE EMPLOYEE ---
router.delete('/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Employee removed from records" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 5. LEADERBOARD ---
router.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await Task.aggregate([
            { $match: { status: "Completed" } },
            {
                $group: {
                    _id: "$userId", 
                    completedTasks: { $sum: 1 },
                    totalPriority: { $sum: "$priority" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "employeeDetails"
                }
            },
            { $unwind: "$employeeDetails" },
            { $sort: { completedTasks: -1, totalPriority: -1 } },
            { $limit: 5 }
        ]);

        res.json(leaderboard);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
