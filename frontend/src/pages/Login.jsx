import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { email, password } : { name, email, password };
      
      const response = await axios.post(`https://task-manager-zg2s.onrender.com${endpoint}`, payload);
      const data = response.data;

      // 💡 SMART DETECTOR: Backend kisi bhi naam se bheje, yeh pakad lega
      const actualToken = data.token || data.accessToken || data.jwt || data.authToken;
      const actualUser = data.user || data.userData || data.details || { name: name || 'Developer', email: email };

      // Agar backend ne sach mein koi token nahi bheja
      if (!actualToken) {
        console.error("🚨 BACKEND RESPONSE:", data);
        setError('Login successful, but no token received from backend. Check console!');
        setLoading(false);
        return;
      }

      // Token aur User ko safely save karo
      localStorage.setItem('token', actualToken);
      localStorage.setItem('user', JSON.stringify(actualUser));
      
      // Success! Dashboard par jao
      navigate('/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-black selection:text-white">
      
      {/* Left Side - Brand & Visuals */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0a0a] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-bold rounded-md">E</div>
            <span className="text-xl font-bold tracking-tight">Ethara.ai</span>
          </div>
          
          <h1 className="text-5xl font-medium leading-[1.1] tracking-tight mb-6">
            Manage your <br/> engineering tasks <br/> with clarity.
          </h1>
          <p className="text-gray-400 text-lg max-w-md">
            Streamline your project timelines, track bug fixes, and deploy faster with our intuitive workspace.
          </p>
        </div>

        <div className="relative z-10 border-t border-white/10 pt-8 mt-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-500 border border-white/20"></div>
            <div>
              <p className="text-sm font-medium">"The best tool for MERN stack deployments."</p>
              <p className="text-xs text-gray-500 mt-1">Lead Developer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        
        <div className="w-full max-w-[420px]">
          <div className="flex lg:hidden items-center gap-2 mb-12">
             <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold rounded-md">E</div>
             <span className="text-xl font-bold tracking-tight">Ethara.ai</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-gray-500 mt-2">
              {isLogin ? 'Enter your details to access your workspace.' : 'Sign up to start managing your projects.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder:text-gray-400"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Email address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder:text-gray-400"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900">Password</label>
                {isLogin && <button type="button" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">Forgot password?</button>}
              </div>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white font-medium py-3.5 rounded-lg hover:bg-gray-900 focus:ring-4 focus:ring-gray-200 transition-all mt-6 active:scale-[0.99] disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                isLogin ? 'Sign In' : 'Sign Up'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }} 
              className="font-medium text-black hover:underline focus:outline-none"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;