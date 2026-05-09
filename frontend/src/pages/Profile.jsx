import { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, LogOut, Settings, Mail, Shield, Play } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If not logged in, redirect to login page
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePendingFeature = (e) => {
    e.preventDefault();
    alert('This feature is currently in development and will be available soon!');
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] pt-28 px-6 sm:px-12 pb-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-10 tracking-tight">Account</h1>
        
        <div className="grid md:grid-cols-12 gap-8 lg:gap-12">
          {/* Sidebar / Left Column */}
          <div className="md:col-span-4 lg:col-span-4 space-y-6">
            <div className="bg-[#141414] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
              <div className="w-24 h-24 bg-netflix-red rounded-full flex items-center justify-center mx-auto mb-4 text-4xl font-bold text-white shadow-lg">
                {user.name ? user.name.charAt(0).toUpperCase() : <User size={40} />}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{user.name || 'Member'}</h2>
              <p className="text-gray-400 text-sm mb-8 flex items-center justify-center gap-2 truncate px-2" title={user.email}>
                <Mail size={16} className="flex-shrink-0" /> <span className="truncate">{user.email}</span>
              </p>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3.5 px-4 rounded-xl transition duration-300"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
            
            <div className="bg-[#141414] border border-white/10 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-5">Quick Links</h3>
              <ul className="space-y-5 text-sm font-medium text-gray-300">
                <li>
                  <Link to="/watchlist" className="hover:text-white transition flex items-center gap-3">
                    <Play size={18} className="text-netflix-red" /> My Watchlist
                  </Link>
                </li>
                <li>
                  <button onClick={handlePendingFeature} className="hover:text-white transition flex items-center gap-3 w-full text-left">
                    <Settings size={18} /> Account Settings
                  </button>
                </li>
                <li>
                  <button onClick={handlePendingFeature} className="hover:text-white transition flex items-center gap-3 w-full text-left">
                    <Shield size={18} /> Privacy & Security
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content / Right Column */}
          <div className="md:col-span-8 lg:col-span-8 space-y-8">
            <div className="bg-[#141414] border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-5">Membership Details</h2>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Current Plan</p>
                  <p className="text-xl font-bold text-white flex items-center gap-3">
                    AIMOVIE Premium <span className="bg-netflix-red text-[11px] px-2.5 py-1 rounded uppercase tracking-widest font-black">Active</span>
                  </p>
                </div>
                <button onClick={handlePendingFeature} className="text-sm font-semibold text-gray-300 hover:text-white transition border border-gray-600 hover:border-white px-5 py-2.5 rounded-lg whitespace-nowrap">
                  Change Plan
                </button>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-gray-300">Next billing date: <strong className="text-white">Next Month</strong></p>
              </div>
            </div>

            <div className="bg-[#141414] border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-5">Profile Settings</h2>
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="overflow-hidden pr-4">
                    <p className="text-white font-medium text-base mb-1">Update Email</p>
                    <p className="text-sm text-gray-400 truncate">{user.email}</p>
                  </div>
                  <button onClick={handlePendingFeature} className="text-sm text-netflix-red font-semibold hover:text-red-400 transition sm:self-center self-start">Edit Email</button>
                </div>
                <div className="h-px w-full bg-white/5"></div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <p className="text-white font-medium text-base mb-1">Change Password</p>
                    <p className="text-sm text-gray-400 tracking-widest">••••••••</p>
                  </div>
                  <button onClick={handlePendingFeature} className="text-sm text-netflix-red font-semibold hover:text-red-400 transition sm:self-center self-start">Update Password</button>
                </div>
                <div className="h-px w-full bg-white/5"></div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="pr-4">
                    <p className="text-white font-medium text-base mb-1">Content Preferences</p>
                    <p className="text-sm text-gray-400">Manage language and maturity ratings.</p>
                  </div>
                  <button onClick={handlePendingFeature} className="text-sm text-netflix-red font-semibold hover:text-red-400 transition sm:self-center self-start">Manage Settings</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
