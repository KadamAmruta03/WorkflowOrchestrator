const Application = require('../models/Application');
const User = require('../models/User');
const { generateEmployeeId } = require('../utils/idGenerator');

function appBaseUrl() {
  return process.env.APP_BASE_URL || 'http://localhost:3000';
}

exports.list = async (req, res) => {
  const list = await Application.find().sort({ createdAt: -1 });
  return res.json(list);
};

exports.create = async (req, res) => {
  const { name, email, role } = req.body || {};
  if (!name || !email || !role) return res.status(400).json({ message: 'name, email, role are required.' });

  const doc = await Application.create({
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    role
  });

  return res.status(201).json(doc);
};

exports.update = async (req, res) => {
  const { status } = req.body || {};
  const allowed = ['Applied', 'Interviewing', 'Rejected'];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Use one of: ${allowed.join(', ')}` });
  }

  const doc = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!doc) return res.status(404).json({ message: 'Application not found.' });
  return res.json(doc);
};

exports.approve = async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) return res.status(404).json({ message: 'Application not found.' });

  if (application.status !== 'Interviewing') {
    return res.status(409).json({ message: 'Only Interviewing applications can be approved.' });
  }

  const employeeId = await generateEmployeeId();

  const employeeType = application.role === 'Intern' ? 'Intern' : 'Full-time';
  const user = await User.create({
    name: application.name,
    email: application.email,
    password: 'TEMP_PASSWORD',
    role: 'Employee',
    employeeId,
    employeeType,
    recruitmentStatus: 'Approved',
    workloadScore: 0,
    skills: []
  });

  application.status = 'Approved';
  application.userId = user._id;
  application.employeeId = employeeId;
  application.approvedAt = new Date();
  await application.save();

  const setPasswordLink = `${appBaseUrl()}/auth?mode=set_password&employeeId=${encodeURIComponent(employeeId)}`;

  return res.json({
    message: 'Approved and onboarded.',
    application,
    user: { id: String(user._id), name: user.name, email: user.email, employeeId: user.employeeId },
    setPasswordLink
  });
};

