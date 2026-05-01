import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Developer');
  const [userId, setUserId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Data States
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]); // Projects fetch karne ke liye
  
  // Form States
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  // 1. Fetch Tasks & Projects
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [tasksRes, projectsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/tasks', { headers }),
        axios.get('http://localhost:5000/api/projects', { headers })
      ]);
      
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined') {
      const user = JSON.parse(userStr);
      setUserName(user.name);
      setUserId(user.id);
    }
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 2. Create Task (With Project & Assignee)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/tasks', 
        { 
          title, priority, dueDate, status: 'Todo',
          project: selectedProject || null,
          assignedTo: assignedTo || userId // Agar koi select nahi kiya, toh khud ko assign karo
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh tasks to get populated project/user names
      fetchData(); 
      setIsModalOpen(false);
      setTitle(''); setDueDate(''); setPriority('Medium'); setSelectedProject(''); setAssignedTo('');
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task!");
    }
  };

  // 3. Update Task Status
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update locally for instant UI change
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Could not update task status.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Helpers
  const formatDate = (dateString) => {
    if (!dateString) return 'No date set';
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); 
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateString) < today;
  };

  // Stats Logic
  const overdueCount = tasks.filter(t => t.status !== 'Done' && isOverdue(t.dueDate)).length;
  const doneCount = tasks.filter(t => t.status === 'Done').length;

  // Render Kanban Column
  const renderColumn = (statusName, bgColor, badgeColor) => {
    const columnTasks = tasks.filter(t => (t.status || 'Todo') === statusName);
    return (
      <div className="flex-1 min-w-[300px] bg-gray-50/50 rounded-2xl p-4 border border-gray-100 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="font-bold text-gray-800">{statusName}</h3>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeColor}`}>{columnTasks.length}</span>
        </div>
        <div className="space-y-4 overflow-y-auto flex-1 pb-4">
          {columnTasks.map(task => (
            <div key={task._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  task.priority === 'High' ? 'bg-red-50 text-red-600' : 
                  task.priority === 'Low' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                }`}>{task.priority || 'Medium'}</span>
                
                <button onClick={() => handleDeleteTask(task._id)} className="text-gray-300 hover:text-red-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-1">{task.title}</h4>
              
              <div className="text-xs text-gray-500 mb-4 space-y-1">
                {task.project && <div className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg> {task.project.title || 'Project'}</div>}
                {task.assignedTo && <div className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> {task.assignedTo.name}</div>}
              </div>

              <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                <span className={`text-xs font-medium ${isOverdue(task.dueDate) && task.status !== 'Done' ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                  {isOverdue(task.dueDate) && task.status !== 'Done' ? '⚠️ Overdue: ' : 'Due: '} {formatDate(task.dueDate)}
                </span>
                
                {/* Status Action Buttons */}
                <div className="flex gap-1">
                  {statusName === 'Todo' && (
                    <button onClick={() => handleUpdateStatus(task._id, 'In Progress')} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded hover:bg-blue-100 transition-colors">Start</button>
                  )}
                  {statusName === 'In Progress' && (
                    <button onClick={() => handleUpdateStatus(task._id, 'Done')} className="px-2 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded hover:bg-green-100 transition-colors">Done</button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {columnTasks.length === 0 && <div className="text-center text-sm text-gray-400 py-6 border-2 border-dashed border-gray-200 rounded-xl">No tasks here</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-white font-sans relative">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between hidden md:flex z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-gray-50">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold rounded-lg mr-3 shadow-md">E</div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Ethara.ai</span>
          </div>
          <nav className="p-4 space-y-1">
            <Link to="/dashboard" className="flex items-center px-4 py-3 bg-gray-900 text-white font-medium rounded-xl shadow-md">
              <svg className="w-5 h-5 mr-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              Board
            </Link>
            <Link to="/projects" className="flex items-center px-4 py-3 text-gray-500 hover:bg-gray-50 font-medium rounded-xl transition-colors">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
              Projects & Teams
            </Link>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-50">
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-red-500 hover:bg-red-50 font-medium rounded-xl transition-colors">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-[#fafafa]">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 z-10 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Good morning, {userName} 👋</h1>
            <p className="text-sm text-gray-500 mt-1">Here's the status of your tasks today.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-black text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-black/20 hover:bg-gray-800 transition-all flex items-center hover:-translate-y-0.5 active:translate-y-0">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            New Task
          </button>
        </header>

        <div className="flex-1 overflow-auto p-8 flex flex-col">
          {/* Stats Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-sm font-semibold text-gray-500">Active Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{tasks.length - doneCount}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-10 -mt-10"></div>
              <p className="text-sm font-semibold text-red-600 relative z-10">Overdue Tasks</p>
              <p className="text-3xl font-bold text-red-700 mt-2 relative z-10">{overdueCount}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-10 -mt-10"></div>
              <p className="text-sm font-semibold text-green-600 relative z-10">Completed</p>
              <p className="text-3xl font-bold text-green-700 mt-2 relative z-10">{doneCount}</p>
            </div>
          </div>

          {/* Kanban Board Layout */}
          <div className="flex gap-6 flex-1 overflow-x-auto pb-4">
            {renderColumn('Todo', 'bg-gray-50', 'bg-gray-200 text-gray-700')}
            {renderColumn('In Progress', 'bg-blue-50/30', 'bg-blue-100 text-blue-700')}
            {renderColumn('Done', 'bg-green-50/30', 'bg-green-100 text-green-700')}
          </div>
        </div>
      </main>

      {/* Advanced Task Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">Create New Task</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white shadow-sm p-1.5 rounded-full border border-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form className="p-6 space-y-5" onSubmit={handleCreateTask}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Task Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all" />
              </div>

              {/* Project & Assignee Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Project Workspace</label>
                  <select value={selectedProject} onChange={(e) => {
                    setSelectedProject(e.target.value);
                    setAssignedTo(''); // Reset assignee when project changes
                  }} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black">
                    <option value="">Personal (No Project)</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Assign To</label>
                  <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} disabled={!selectedProject} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black disabled:opacity-50">
                    <option value="">{selectedProject ? "Assign to myself" : "Select a project first"}</option>
                    {selectedProject && projects.find(p => p._id === selectedProject)?.members.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black">
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                  <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black" />
                </div>
              </div>

              <div className="pt-4 flex gap-3 border-t border-gray-50 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/2 px-4 py-3 text-gray-700 font-semibold bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="w-1/2 px-4 py-3 text-white font-semibold bg-black rounded-xl hover:bg-gray-900 transition-all shadow-lg shadow-black/20 hover:-translate-y-0.5">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;