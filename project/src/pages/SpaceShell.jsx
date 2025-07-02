import { useState, useEffect } from 'react';
import { Outlet, useParams, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, FileText, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../api';
import Sidebar from '../components/Sidebar';
import Spinner from '../components/Spinner';

export default function SpaceShell() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    // Redirect to chat tab by default
    if (location.pathname === `/space/${id}`) {
      navigate(`/space/${id}/chat`, { replace: true });
    }
  }, [id, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return <Navigate to="/dashboard" replace />;
  }

  // Generate gradient from title hash
  const hash = space.title.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  const hue = Math.abs(hash) % 360;

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare, path: `/space/${id}/chat` },
    { id: 'docs', label: 'Documents', icon: FileText, path: `/space/${id}/docs` },
  ];

  const activeTab = location.pathname.includes('/docs') ? 'docs' : 'chat';

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Space Header */}
        <div className="bg-white border-b border-slate-200/60">
          {/* Gradient Strip */}
          <div
            className="h-1 bg-gradient-to-r"
            style={{
              background: `linear-gradient(135deg, hsl(${hue}, 90%, 60%), hsl(${hue}, 60%, 45%))`
            }}
          />
          
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  {space.title}
                </h1>
                {space.description && (
                  <p className="text-slate-600 mt-1">{space.description}</p>
                )}
              </div>
              
              {/* Tab Navigation */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => navigate(tab.path)}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        isActive
                          ? 'text-slate-900 bg-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      {isActive && (
                        <motion.div
                          layoutId="activeSpaceTab"
                          className="absolute inset-0 bg-white rounded-md shadow-sm"
                          style={{ zIndex: -1 }}
                          initial={false}
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          <Outlet context={{ space }} />
        </div>
      </div>
    </div>
  );
}