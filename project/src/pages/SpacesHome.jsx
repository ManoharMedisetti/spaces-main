import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Calendar, User, LogOut, Sparkles, ChevronDown, BookOpen, MessageSquare, Sun, MoreHorizontal, Edit, Trash2, Zap } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useThemeStore } from '../store/theme';
import { api } from '../api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import ThemeToggle from '../components/ThemeToggle';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router-dom';

dayjs.extend(relativeTime);

function TopBar({ searchQuery, setSearchQuery, filterBy, setFilterBy, onCreateSpace, onLogout, userName }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All Spaces' },
    { value: 'recent', label: 'Recently Updated' },
    { value: 'alphabetical', label: 'Alphabetical' },
  ];

  return (
    <div className="sticky top-0 z-40 bg-[#0A0A0A]/95 dark:bg-[#0A0A0A]/95 light:bg-white/95 backdrop-blur-xl border-b border-gray-800/50 dark:border-gray-800/50 light:border-gray-200/50">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7C5CFC] to-[#6B4CE6] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#7C5CFC]/30">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-[#7C5CFC]/20 to-[#6B4CE6]/20 rounded-2xl blur-lg -z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-heading text-white dark:text-white light:text-gray-900">TutorWise</h1>
              <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 font-medium">Intelligent Learning Spaces</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4 flex-1 max-w-lg mx-12">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-500 light:text-gray-400" />
              <input
                type="text"
                placeholder="Search your spaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-900/60 dark:bg-gray-900/60 light:bg-white/60 border border-gray-700/50 dark:border-gray-700/50 light:border-gray-300/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/30 focus:border-[#7C5CFC]/50 transition-all text-gray-100 dark:text-gray-100 light:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500 light:placeholder-gray-400 backdrop-blur-sm"
              />
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-3 px-4 py-4 bg-gray-900/60 dark:bg-gray-900/60 light:bg-white/60 border border-gray-700/50 dark:border-gray-700/50 light:border-gray-300/50 rounded-2xl text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-gray-800/60 dark:hover:bg-gray-800/60 light:hover:bg-gray-100/60 transition-all backdrop-blur-sm"
              >
                <Filter className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </button>
              
              <AnimatePresence>
                {showFilterMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-16 w-52 bg-gray-900/95 dark:bg-gray-900/95 light:bg-white/95 backdrop-blur-xl border border-gray-700/50 dark:border-gray-700/50 light:border-gray-200/50 rounded-2xl shadow-2xl py-2"
                  >
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilterBy(option.value);
                          setShowFilterMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-800/60 dark:hover:bg-gray-800/60 light:hover:bg-gray-100/60 transition-colors ${
                          filterBy === option.value ? 'text-[#7C5CFC] font-medium' : 'text-gray-300 dark:text-gray-300 light:text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            <button
              onClick={onCreateSpace}
              className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE6] hover:from-[#8B6BFF] hover:to-[#7C5CFC] text-white rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-[#7C5CFC]/25 hover:shadow-[#7C5CFC]/40 hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              New Space
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-800 dark:to-gray-900 light:from-gray-200 light:to-gray-300 rounded-2xl flex items-center justify-center hover:from-gray-700 hover:to-gray-800 dark:hover:from-gray-700 dark:hover:to-gray-800 light:hover:from-gray-300 light:hover:to-gray-400 transition-all border border-gray-700/50 dark:border-gray-700/50 light:border-gray-300/50"
              >
                <User className="w-5 h-5 text-gray-400 dark:text-gray-400 light:text-gray-600" />
              </button>
              
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-16 w-56 bg-gray-900/95 dark:bg-gray-900/95 light:bg-white/95 backdrop-blur-xl border border-gray-700/50 dark:border-gray-700/50 light:border-gray-200/50 rounded-2xl shadow-2xl py-3"
                  >
                    <div className="px-4 py-3 border-b border-gray-700/50 dark:border-gray-700/50 light:border-gray-200/50">
                      <p className="text-sm font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900 truncate">{userName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 light:text-gray-600">Premium Account</p>
                    </div>
                    <button
                      onClick={() => {
                        onLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-900/20 dark:hover:bg-red-900/20 light:hover:bg-red-50 transition-colors flex items-center gap-3"
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
  );
}

function NewSpaceModal({ isOpen, onClose, onSpaceCreated }) {
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const { user_id } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createSpace({
        title: formData.title,
        description: formData.description,
        owner_id: user_id,
      });
      onSpaceCreated();
      onClose();
      setFormData({ title: '', description: '' });
    } catch (error) {
      console.error('Error creating space:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Space" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-200 dark:text-gray-200 light:text-gray-800 mb-3">
            Space Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-4 bg-gray-900/60 dark:bg-gray-900/60 light:bg-white/60 border border-gray-700/50 dark:border-gray-700/50 light:border-gray-300/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/30 focus:border-[#7C5CFC]/50 transition-all text-gray-100 dark:text-gray-100 light:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500 light:placeholder-gray-400"
            placeholder="e.g., Advanced Physics, Marketing Strategy..."
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-200 dark:text-gray-200 light:text-gray-800 mb-3">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-4 bg-gray-900/60 dark:bg-gray-900/60 light:bg-white/60 border border-gray-700/50 dark:border-gray-700/50 light:border-gray-300/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/30 focus:border-[#7C5CFC]/50 transition-all resize-none text-gray-100 dark:text-gray-100 light:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500 light:placeholder-gray-400"
            placeholder="Describe what you'll be studying in this space..."
          />
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-4 text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-gray-800/60 dark:hover:bg-gray-800/60 light:hover:bg-gray-100/60 rounded-2xl transition-colors border border-gray-700/50 dark:border-gray-700/50 light:border-gray-300/50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE6] hover:from-[#8B6BFF] hover:to-[#7C5CFC] text-white rounded-2xl transition-all font-semibold"
          >
            {loading && <Spinner size="sm" />}
            Create Space
          </button>
        </div>
      </form>
    </Modal>
  );
}

function SpaceCard({ space, onDelete }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this space?')) {
      await onDelete(space.id);
    }
    setShowMenu(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative cursor-pointer transition-all duration-500"
      onClick={() => navigate(`/space/${space.id}`)}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 space-pattern rounded-3xl" />
      
      {/* Overlay */}
      <div className="absolute inset-0 space-pattern-overlay rounded-3xl opacity-90 group-hover:opacity-95 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative p-8 h-64 flex flex-col justify-between rounded-3xl border border-white/10 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-heading text-white mb-3 line-clamp-2 group-hover:scale-105 transition-transform duration-300">
              {space.title}
            </h3>
            {space.description && (
              <p className="text-white/80 text-sm line-clamp-2 leading-relaxed">
                {space.description}
              </p>
            )}
          </div>
          
          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 bg-white/10 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 border border-white/20"
            >
              <MoreHorizontal className="w-4 h-4 text-white" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-12 w-44 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl py-2 z-10"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-800/60 flex items-center gap-3 text-gray-300"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Space
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-red-900/20 text-red-400 flex items-center gap-3"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-white/70 font-medium">
            <Calendar className="w-3 h-3 mr-2" />
            {dayjs(space.created_at).fromNow()}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-white/70 font-medium">Active</span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-white/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/5 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>
    </motion.div>
  );
}

function CreateSpaceCard({ onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative cursor-pointer transition-all duration-500"
      onClick={onClick}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/40 dark:from-gray-900/40 light:from-gray-100/40 to-gray-800/20 dark:to-gray-800/20 light:to-gray-200/20 backdrop-blur-sm border-2 border-dashed border-gray-700/60 dark:border-gray-700/60 light:border-gray-300/60 rounded-3xl group-hover:border-[#7C5CFC]/60 group-hover:from-[#7C5CFC]/10 group-hover:to-[#6B4CE6]/5 transition-all duration-500" />
      
      {/* Content */}
      <div className="relative p-8 flex flex-col items-center justify-center text-center h-64">
        <div className="w-20 h-20 bg-gradient-to-br from-[#7C5CFC]/20 to-[#6B4CE6]/10 rounded-3xl flex items-center justify-center mb-6 group-hover:from-[#7C5CFC]/30 group-hover:to-[#6B4CE6]/20 transition-all group-hover:scale-110 border border-[#7C5CFC]/30">
          <Plus className="w-10 h-10 text-[#7C5CFC]" />
        </div>
        <h3 className="text-xl font-heading text-white dark:text-white light:text-gray-900 mb-3">Create New Space</h3>
        <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 leading-relaxed max-w-xs">
          Start a new learning journey with organized materials and AI assistance
        </p>
      </div>
    </motion.div>
  );
}

function EmptyState({ onCreateSpace }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-24"
    >
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-gradient-to-br from-[#7C5CFC]/20 to-[#6B4CE6]/10 rounded-full flex items-center justify-center mx-auto">
          <Zap className="w-16 h-16 text-[#7C5CFC]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C5CFC]/10 to-[#6B4CE6]/5 rounded-full blur-2xl" />
      </div>
      <h2 className="text-4xl font-heading text-white dark:text-white light:text-gray-900 mb-4">
        Welcome to TutorWise
      </h2>
      <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
        Create your first learning space to organize study materials and chat with an AI tutor that understands your content.
      </p>
      <button
        onClick={onCreateSpace}
        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE6] hover:from-[#8B6BFF] hover:to-[#7C5CFC] text-white rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-[#7C5CFC]/25 hover:shadow-[#7C5CFC]/40 hover:-translate-y-1"
      >
        <Plus className="w-5 h-5" />
        Create Your First Space
      </button>
    </motion.div>
  );
}

export default function SpacesHome() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewSpaceModal, setShowNewSpaceModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const { user_id, full_name, logout } = useAuthStore();

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const fetchSpaces = async () => {
    try {
      const data = await api.listSpaces(user_id);
      setSpaces(data || []);
    } catch (error) {
      showToast('error', 'Failed to load spaces');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpace = async (spaceId) => {
    try {
      await api.deleteSpace(spaceId);
      setSpaces(spaces.filter(space => space.id !== spaceId));
      showToast('success', 'Space deleted successfully');
    } catch (error) {
      showToast('error', 'Failed to delete space');
    }
  };

  const filteredSpaces = spaces.filter(space => {
    const matchesSearch = space.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (space.description && space.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  }).sort((a, b) => {
    if (filterBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    if (filterBy === 'recent') {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    return 0;
  });

  useEffect(() => {
    fetchSpaces();
  }, [user_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] dark:bg-[#0A0A0A] light:bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#7C5CFC] to-[#6B4CE6] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">Loading your spaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] dark:bg-[#0A0A0A] light:bg-white">
      <TopBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
        onCreateSpace={() => setShowNewSpaceModal(true)}
        onLogout={logout}
        userName={full_name}
      />

      <div className="max-w-7xl mx-auto px-8 py-12">
        {spaces.length === 0 && !searchQuery ? (
          <EmptyState onCreateSpace={() => setShowNewSpaceModal(true)} />
        ) : (
          <>
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl font-heading text-white dark:text-white light:text-gray-900 mb-3">
                Your Learning Spaces
              </h1>
              <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-lg">
                {filteredSpaces.length} {filteredSpaces.length === 1 ? 'space' : 'spaces'}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSpaces.map((space, index) => (
                <motion.div
                  key={space.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SpaceCard space={space} onDelete={handleDeleteSpace} />
                </motion.div>
              ))}
              
              {/* Create New Space Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: filteredSpaces.length * 0.1 }}
              >
                <CreateSpaceCard onClick={() => setShowNewSpaceModal(true)} />
              </motion.div>
            </div>
          </>
        )}
      </div>

      <NewSpaceModal
        isOpen={showNewSpaceModal}
        onClose={() => setShowNewSpaceModal(false)}
        onSpaceCreated={fetchSpaces}
      />

      <Toast
        isVisible={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}