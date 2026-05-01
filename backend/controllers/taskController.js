const Task = require('../models/Task');

// 1. Naya Task Create karna
exports.createTask = async (req, res) => {
  try {
    const { title, description, project, priority, status, dueDate, assignedTo } = req.body;

    const newTask = new Task({
      title,
      description,
      priority: priority || 'Medium',
      status: status || 'Todo',
      dueDate,
      project: project || null, 
      assignedTo: assignedTo || (req.user ? req.user.userId : null)
    });

    await newTask.save();
    res.status(201).json(newTask);
    
  } catch (error) {
    console.error("Task Create Error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 2. Tasks dekhna (Dashboard ke liye)
exports.getTasks = async (req, res) => {
  try {
    let filter = {};
    if (req.user && req.user.role === 'Member') {
      filter.assignedTo = req.user.userId;
    }

    const tasks = await Task.find(filter)
      .populate('project', 'title') 
      .populate('assignedTo', 'name email'); 

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Get Tasks Error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 3. Task ka status update karna
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const taskId = req.params.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task nahi mila' });
    }

    if (req.user && req.user.role !== 'Admin' && task.assignedTo && task.assignedTo.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Aap sirf apne tasks update kar sakte hain.' });
    }

    task.status = status;
    await task.save();

    res.status(200).json({ message: 'Task status update ho gaya!', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 4. Task ko Delete karna (Yeh ab perfectly add ho gaya hai)
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task nahi mila' });
    }

    await Task.findByIdAndDelete(taskId);

    res.status(200).json({ message: 'Task successfully delete ho gaya!' });
  } catch (error) {
    console.error("Delete Task Error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};