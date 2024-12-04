const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(express.json());

const filePath = path.join(__dirname, 'tasks.json');

const readTasks = () => {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const writeTasks = (tasks) => {
  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));
};

app.post('/tasks', (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required.' });
  }

  const tasks = readTasks();
  const newTask = { id: uuidv4(), title, description, status: 'pending' };
  tasks.push(newTask);
  writeTasks(tasks);

  res.status(201).json({ message: 'Task created successfully!', task: newTask });
});

app.get('/tasks', (req, res) => {
  const tasks = readTasks();
  res.status(200).json({ message: 'Tasks retrieved successfully!', tasks });
});

app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || (status !== 'pending' && status !== 'completed')) {
    return res.status(400).json({ message: 'Status must be either "pending" or "completed".' });
  }

  const tasks = readTasks();
  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found.' });
  }

  tasks[taskIndex].status = status;
  writeTasks(tasks);

  res.status(200).json({ message: 'Task status updated successfully!', task: tasks[taskIndex] });
});

app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;

  const tasks = readTasks();
  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  const deletedTask = tasks.splice(taskIndex, 1);
  writeTasks(tasks);

  res.status(200).json({ message: 'Task deleted successfully!', task: deletedTask[0] });
});

app.get('/tasks/status/:status', (req, res) => {
  const { status } = req.params;

  if (status !== 'pending' && status !== 'completed') {
    return res.status(400).json({ message: 'Invalid status. Use "pending" or "completed".' });
  }

  const tasks = readTasks();

  const filteredTasks = tasks.filter((task) => task.status === status);

  res.status(200).json({
    message: `Tasks with status: ${status}`,
    tasks: filteredTasks,
  });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
