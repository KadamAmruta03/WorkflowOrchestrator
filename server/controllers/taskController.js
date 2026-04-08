const Task = require('../models/Task');
const User = require('../models/User');

// 1. ADD THIS NEW FUNCTION to handle fetching all tasks
exports.getAllTasks = async (req, res) => {
    try {
        // Find all tasks and populate the 'assignedTo' field with user data
        const tasks = await Task.find().populate('assignedTo');
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tasks", details: err.message });
    }
};

// 2. Existing "Assign" logic
exports.assignNewTask = async (req, res) => {
    try {
        const { title, priority, userId } = req.body;
        const user = await User.findById(userId);

        if (user.workloadScore + priority > 15) {
            return res.status(400).json({ message: "Blocked: Task would cause employee burnout!" });
        }

        const newTask = new Task({ title, priority, assignedTo: userId, status: 'Assigned' });
        await newTask.save();

        user.workloadScore += priority;
        await user.save();

        res.json({ message: "Task Assigned & Orchestrated!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Existing "Complete" logic
exports.completeTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findById(taskId);
        const user = await User.findById(task.assignedTo);

        user.workloadScore -= task.priority;
        user.xp += (task.priority * 10);

        task.status = 'Completed';
        
        await user.save();
        await task.save();

        res.json({ message: "Task Completed! XP Awarded." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};