const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const os = require('os');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb-service:27017/devsecops_db';
const APP_VERSION = process.env.APP_VERSION || 'v1.0.0';
const APP_COLOR = process.env.APP_COLOR || 'blue';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Task = mongoose.model('Task', TaskSchema);

// Health Check لـ Kubernetes & Argo Rollouts
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  if (isDbConnected) {
    return res.status(200).json({ status: 'HEALTHY', db: 'Connected' });
  }
  return res.status(500).json({ status: 'UNHEALTHY', db: 'Disconnected' });
});

// System Info لعرض اسم الـ Pod ولون البيئة (Blue/Green)
app.get('/api/info', (req, res) => {
  res.json({
    version: APP_VERSION,
    deploymentColor: APP_COLOR,
    podName: os.hostname(),
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    if (!req.body.title) return res.status(400).json({ error: 'Title is required' });
    const newTask = await Task.create({ title: req.body.title });
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend (${APP_COLOR} - ${APP_VERSION}) running on port ${PORT}`);
});
