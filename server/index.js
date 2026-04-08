const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions = allowedOrigins.length
    ? {
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
        }
    }
    : undefined;

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Routes Imports
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const authRoutes = require('./routes/authRoutes');
const onboardingRoutes = require('./routes/onboardingRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const chatRoutes = require('./routes/chatRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const meetingRoutes = require('./routes/meetingRoutes');

const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/meetings', meetingRoutes);

// 1. Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ DB Error: ", err));

const User = require('./models/User'); // Ensure this matches your User model path

app.patch('/api/employees/:id', async (req, res) => {
    try {
        const { recruitmentStatus } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            { recruitmentStatus: recruitmentStatus },
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ error: "Employee not found" });
        }
        
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: "Database update failed", details: err.message });
    }
});

cron.schedule('* * * * *', async () => {
    try {
        const Task = require('./models/Task');
        const staleTime = new Date(Date.now() - 48 * 60 * 60 * 1000);

        const stuckTasks = await Task.find({
            $or: [
                { status: 'Assigned' },
                { status: 'Pending', updatedAt: { $lt: staleTime } }
            ],
            isEscalated: false
        });

        for (let task of stuckTasks) {
            task.isEscalated = true;
            await task.save();
            console.log(`Self-Healed: ${task.title} escalated due to inactivity.`);
        }
    } catch (err) {
        console.error("Cron Error:", err);
    }
});


app.use(notFound);
app.use(errorHandler);
// Start Server

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
