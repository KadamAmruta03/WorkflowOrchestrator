const Task = require('./models/Task');
const User = require('./models/User');

// Create a new task
exports.createTask = async (req, res) => {
    try {
        const newTask = new Task(req.body);
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Smart Assign with Burnout Guard
exports.assignTask = async (req, res) => {
    try {
        const { taskId, userId } = req.body;
        const user = await User.findById(userId);
        const task = await Task.findById(taskId);

        // THE BURNOUT GUARD: Limit workloadScore to 15
        if (user.workloadScore + task.priority > 15) {
            return res.status(400).json({ 
                message: "Assignment Blocked! Employee is at risk of burnout. Choose someone else." 
            });
        }

        // Assign Task
        task.assignedTo = userId;
        task.status = 'Assigned';
        await task.save();

        // Update User Workload
        user.workloadScore += task.priority;
        await user.save();

        res.status(200).json({ message: "Task Orchestrated Successfully", task });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};