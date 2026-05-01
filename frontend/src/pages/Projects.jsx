import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    else fetchProjects();
  }, [navigate]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/projects', 
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects([...projects, response.data]);
      setIsModalOpen(false);
      setName('');
      setDescription('');
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project");
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-gray-50">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold rounded-lg mr-3">E</div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Ethara.ai</span>
          </div>
          <nav className="p-4 space-y-1">
            {/* Link to Dashboard */}
            <Link to="/dashboard" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 font-medium rounded-xl transition-colors">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              Tasks Dashboard
            </Link>
            {/* Active Link: Projects */}
            <Link to="/projects" className="flex items-center px-4 py-3 bg-gray-50 text-black font-medium rounded-xl">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
              Projects & Teams
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Projects</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your workspaces and teams here.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-black text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:bg-gray-800 transition-all flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            New Project
          </button>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length === 0 ? (
              <p className="text-gray-500">No projects found. Create one to get started!</p>
            ) : (
              projects.map(project => (
                <div key={project._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{project.description || 'No description provided.'}</p>
                  <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">
                      Team Members: {project.members?.length || 1}
                    </span>
                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                      View Board &rarr;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create Workspace</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Project Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border rounded-xl" placeholder="e.g. HealthTech App" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border rounded-xl" placeholder="What is this project about?" rows="3" />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/2 px-4 py-3 bg-white border rounded-xl font-semibold">Cancel</button>
                <button type="submit" className="w-1/2 px-4 py-3 bg-black text-white rounded-xl font-semibold">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;