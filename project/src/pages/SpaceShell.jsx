import { useState, useEffect } from 'react';
import { Outlet, useParams, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, FileText, ArrowLeft, User, LogOut, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';
import { useAuthStore } from '../store/auth';
import Spinner from '../components/Spinner';

export default function SpaceShell() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { full_name, logout } = useAuthStore();

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        const data = await api.getSpace(id);
        setSpace(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSpace();
  }, [id]);

  useEffect(() => {
    if (location.pathname === `/space/${id}`) {
      navigate(`/space/${id}/chat`, { replace: true });
    }
  }, [id, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#7C5CFC] to-[#6B4CE6] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400">Loading space...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <Navigate to="/dashboard" replace />;
  }

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare, path: `/space/${id}/chat` },
    { id: 'docs', label: 'Documents', icon: FileText, path: `/space/${id}/docs` },
  ];

  const activeTab = location.pathname.includes('/docs') ? 'docs' : 'chat';

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Back Button & Space Info */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-3 hover:bg-gray-800/60 rounded-2xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              
              <div className="flex items-center gap-4">
                {space.cover_image && (
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-gray-700/50">
                    <img
                      src={space.cover_image}
                      alt={space.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    {space.title}
                  </h1>
                  {space.description && (
                    <p className="text-sm text-gray-400 truncate max-w-md">
                      {space.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Tab Navigation & Actions */}
            <div className="flex items-center gap-8">
              <div className="flex bg-gray-900/60 backdrop-blur-sm rounded-2xl p-1 border border-gray-700/50">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => navigate(tab.path)}
                      className={`relative flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'text-white bg-gray-800/80 shadow-lg'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      {isActive && (
                        <motion.div
                          layoutId="activeSpaceTab"
                          className="absolute inset-0 bg-gray-800/80 rounded-xl shadow-lg"
                          style={{ zIndex: -1 }}
                          initial={false}
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center hover:from-gray-700 hover:to-gray-800 transition-all border border-gray-700/50"
                >
                  <User className="w-5 h-5 text-gray-400" />
                </button>
                
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-16 w-56 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl py-3"
                    >
                      <div className="px-4 py-3 border-b border-gray-700/50">
                        <p className="text-sm font-semibold text-white truncate">{full_name}</p>
                        <p className="text-xs text-gray-500">Premium Account</p>
                      </div>
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800/60 transition-colors"
                      >
                        Back to Dashboard
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-900/20 transition-colors flex items-center gap-3"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        <Outlet context={{ space }} />
      </div>
    </div>
  );
}