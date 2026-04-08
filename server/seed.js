const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Task = require('./models/Task');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        // Clear existing data to start fresh
        await User.deleteMany({});
        await Task.deleteMany({});

        // 1. Create Sample Employees with Skills
        const employees = await User.insertMany([
            { name: "Rahul Sharma", email: "rahul@work.com", password: "password123", role: "Employee", skills: ["React", "NodeJS"], workloadScore: 5 },
            { name: "Anjali Singh", email: "anjali@work.com", password: "password123", role: "Employee", skills: ["Python", "Data Science"], workloadScore: 12 },
            { name: "Kevin Peter", email: "kevin@work.com", password: "password123", role: "Employee", skills: ["Figma", "UI Design"], workloadScore: 2 }
        ]);

        // 2. Create Sample Tasks
        await Task.insertMany([
            { title: "Fix Dashboard Bugs", priority: 3, requiredSkills: ["React"], status: "Assigned", assignedTo: employees[0]._id },
            { title: "AI Model Training", priority: 5, requiredSkills: ["Python"], status: "Draft" },
            { title: "Design New Logo", priority: 2, requiredSkills: ["UI Design"], status: "Assigned", assignedTo: employees[2]._id }
        ]);

        console.log("✅ Database Seeded Successfully!");
        process.exit();
    } catch (err) {
        console.error("❌ Seeding Error:", err);
        process.exit(1);
    }
};

seedData();