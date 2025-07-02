import { motion } from 'framer-motion';
import { BookOpen, Home, LogOut, User, Plus } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiService } from '../api'; // replaced hard-coded URL

export default function Sidebar() {
  const { full_name, email, logout, user_id } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [spaces, setSpaces] = useState([]);

  const fetchSpaces = async () => {
    try {
      const data = await apiService.listSpaces(user_id); // replaced hard-coded URL
      setSpaces(data?.slice(0, 5) || []); // Show only first 5 spaces
    } catch (error) {
      console.error('Failed to fetch spaces:', error);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, [user_id]);

  const isActive = (path) => location.pathname === path;
  const isSpaceActive = (spaceId) => location.pathname.includes(`/space/${spaceId}`);

  // Generate gradient from title hash
  const getSpaceGradient = (title) => {
    const hash = title.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200/60 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            
          </div>
          <span className="font-bold text-lg tracking-tight"><img className ="h-10" src="https://res.cloudinary.com/dy1txrjmy/image/upload/v1751370780/tutorwisespaces_bpbt1o.png" alt="" /></span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/dashboard')
                ? 'bg-violet-50 text-violet-700 border border-violet-200/60'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>
        </div>

        {/* Spaces List */}
        {spaces.length > 0 && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Recent Spaces
              </h3>
              <button
                onClick={() => navigate('/dashboard')}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
                title="Create new space"
              >
                <Plus className="w-3 h-3 text-slate-400" />
              </button>
            </div>
            <div className="space-y-1">
              {spaces.map((space) => (
                <button
                  key={space.id}
                  onClick={() => navigate(`/space/${space.id}`)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group ${
                    isSpaceActive(space.id)
                      ? 'bg-violet-50 text-violet-700 border border-violet-200/60'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getSpaceGradient(space.title) }}
                  />
                  <span className="truncate">{space.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Menu */}
      <div className="p-4 border-t border-slate-200/60">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
          <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {full_name || 'User'}
            </p>
            <p className="text-xs text-slate-500 truncate">{email}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
