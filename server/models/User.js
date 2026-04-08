const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Personal Info
    name: { type: String, required: true },
    gender: { type: String },
    dob: { type: String },
    calculatedAge: { type: Number },
    mobile: { type: String },

    // Account Info
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Employee' }, 

    // Professional Info
    employeeId: { type: String, unique: true },
    department: { type: String },
    designation: { type: String },
    doj: { type: String },
    skills: [String],

    // New Fields from Onboarding Portal
    employeeType: { 
        type: String, 
        enum: ['Full-time', 'Intern', 'Contract', 'Undefined'],
        default: 'Undefined' 
    },
    recruitmentStatus: { 
        type: String, 
        enum: ['Applied', 'Interviewed', 'Approved'],
        default: 'Applied' 
    },

    // System Stats
    workloadScore: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    attendanceStatus: { type: String, default: 'Present' } 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);