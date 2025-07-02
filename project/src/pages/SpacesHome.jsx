import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Calendar, MoreVertical, Trash2, Edit3 } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { apiService } from '../api'; // replaced hard-coded URL
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router-dom';

dayjs.extend(relativeTime);

function NewSpaceModal({ isOpen, onClose, onSpaceCreated }) {
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const { user_id } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiService.createSpace({ // replaced hard-coded URL
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
            Space Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
            placeholder="e.g., Advanced Physics, Marketing Strategy..."
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors resize-none"
            placeholder="Describe what you'll be studying in this space..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white px-4 py-2 transition-colors"
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
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  // Generate gradient from title hash
  const hash = space.title.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  const hue = Math.abs(hash) % 360;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this space?')) {
      await onDelete(space.id);
    }
    setShowMenu(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
      onClick={() => navigate(`/space/${space.id}`)}
    >
      {/* Gradient Header */}
      <div
        className="h-24 bg-gradient-to-r"
        style={{
          background: `linear-gradient(135deg, hsl(${hue}, 90%, 60%), hsl(${hue}, 60%, 45%))`
        }}
      />

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900 group-hover:text-violet-600 transition-colors line-clamp-2">
            {space.title}
          </h3>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle edit
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {space.description && (
          <p className="text-slate-600 text-sm mb-4 line-clamp-2">
            {space.description}
          </p>
        )}

        <div className="flex items-center text-xs text-slate-500">
          <Calendar className="w-3 h-3 mr-1" />
          Created {dayjs(space.created_at).fromNow()}
        </div>
      </div>
    </motion.div>
  );
}

export default function SpacesHome() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewSpaceModal, setShowNewSpaceModal] = useState(false);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const { user_id, full_name } = useAuthStore();

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const fetchSpaces = async () => {
    try {
      const data = await apiService.listSpaces(user_id); // replaced hard-coded URL
      setSpaces(data || []);
    } catch (error) {
      showToast('error', 'Failed to load spaces');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpace = async (spaceId) => {
    try {
      await apiService.deleteSpace(spaceId); // replaced hard-coded URL
      setSpaces(spaces.filter(space => space.id !== spaceId));
      showToast('success', 'Space deleted successfully');
    } catch (error) {
      showToast('error', 'Failed to delete space');
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, [user_id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome back, {full_name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-slate-600 mt-2">
                Manage your learning spaces and continue your studies
              </p>
            </div>
            <button
              onClick={() => setShowNewSpaceModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Space
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {spaces.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-violet-100 rounded-full mb-6">
              <BookOpen className="w-10 h-10 text-violet-600" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-3">
              Create your first learning space
            </h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Spaces help you organize your study materials and chat with an AI tutor about specific topics.
            </p>
            <button
              onClick={() => setShowNewSpaceModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Space
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space, index) => (
              <motion.div
                key={space.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <SpaceCard space={space} onDelete={handleDeleteSpace} />
              </motion.div>
            ))}
          </div>
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