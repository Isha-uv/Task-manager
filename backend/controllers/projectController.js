// backend/controllers/projectController.js
const Project = require('../models/Project');
const User = require('../models/User');

// 1. Naya Project Create Karna
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const newProject = new Project({
      name,
      description,
      owner: req.user.userId,
      // Jisne banaya wo automatically pehla member ban jayega
      members: [req.user.userId] 
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 2. Apne Projects Dekhna
exports.getProjects = async (req, res) => {
  try {
    // Sirf wo projects lao jisme logged-in user ek 'member' hai
    const projects = await Project.find({ members: req.user.userId })
      .populate('owner', 'name email') // Owner ka naam aur email lao
      .populate('members', 'name email'); // Sabhi members ka naam aur email lao

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 3. Project mein naya Team Member add karna
exports.addMember = async (req, res) => {
  try {
    const { email } = req.body; // Naye member ki email frontend se aayegi
    const projectId = req.params.id;

    // Pehle check karo ki is email se koi user exist karta bhi hai ya nahi
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User nahi mila. Pehle unhe Ethara par signup karna hoga.' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project nahi mila' });
    }

    // Check karo ki user pehle se project mein to nahi hai
    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: 'Yeh user pehle se is project ka member hai.' });
    }

    // User ko project ke members array mein push kardo
    project.members.push(userToAdd._id);
    await project.save();

    res.status(200).json({ message: 'Member successfully add ho gaya!', project });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};