import { motion } from 'framer-motion';
import { BookOpen, Home, LogOut, User, Plus, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Sidebar() {
  const { full_name, email, logout, user_id } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [spaces, setSpaces] = useState([]);

  const fetchSpaces = async () => {
    try {
      const data = await api.listSpaces(user_id);
      setSpaces(data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Failed to fetch spaces:', error);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, [user_id]);

  const isActive = (path) => location.pathname === path;
  const isSpaceActive = (spaceId) => location.pathname.includes(`/space/${spaceId}`);

  const getSpaceGradient = (title) => {
    const hash = title.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 65%, 55%)`;
  };

  return (
    <div className="w-72 h-screen bg-white/95 backdrop-blur-xl border-r border-slate-200/50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-semibold text-lg tracking-tight text-slate-900">TutorWise</span>
            <div className="text-xs text-slate-500 font-medium">Spaces</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 space-y-1">
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive('/dashboard')
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>
        </div>

        {/* Spaces List */}
        {spaces.length > 0 && (
          <div className="px-4 mt-8">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Recent Spaces
              </h3>
              <button
                onClick={() => navigate('/dashboard')}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                title="Create new space"
              >
                <Plus className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-1">
              {spaces.map((space) => (
                <button
                  key={space.id}
                  onClick={() => navigate(`/space/${space.id}`)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 group ${
                    isSpaceActive(space.id)
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: getSpaceGradient(space.title) }}
                  />
                  <span className="truncate font-medium">{space.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Menu */}
      <div className="p-4 border-t border-slate-200/50">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50/80 backdrop-blur-sm">
          <div className="w-9 h-9 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {full_name || 'User'}
            </p>
            <p className="text-xs text-slate-500 truncate">{email}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-slate-200/80 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
}