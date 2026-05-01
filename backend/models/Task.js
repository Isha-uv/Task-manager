const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['Todo', 'In Progress', 'Done'], 
    default: 'Todo' 
  },
  priority: {  // <-- Frontend ki priority ke liye naya add kiya
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: false // <-- Isko abhi false kiya kyunki hamare form mein project list nahi hai
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  dueDate: { 
    type: Date, 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);