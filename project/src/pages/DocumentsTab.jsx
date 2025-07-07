import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, File, Image, Video, CheckCircle, Clock, AlertCircle, X, UploadCloud as CloudUpload } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { api } from '../api';
import Toast from '../components/Toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const fileIcons = {
  'application/pdf': FileText,
  'application/msword': FileText,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileText,
  'text/plain': FileText,
  'image/jpeg': Image,
  'image/png': Image,
  'image/gif': Image,
  'video/mp4': Video,
  'video/avi': Video,
};

const statusConfig = {
  processing: { icon: Clock, color: 'text-amber-400 bg-amber-900/20 border-amber-700/50', label: 'Processing' },
  processed: { icon: CheckCircle, color: 'text-green-400 bg-green-900/20 border-green-700/50', label: 'Ready' },
  failed: { icon: AlertCircle, color: 'text-red-400 bg-red-900/20 border-red-700/50', label: 'Failed' },
};

function StatusChip({ status }) {
  const config = statusConfig[status] || statusConfig.processing;
  const Icon = config.icon;
  
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </div>
  );
}

function UploadDropzone({ onFileUpload }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    const newUploads = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      progress: 0,
    }));
    
    setUploadingFiles(prev => [...prev, ...newUploads]);

    for (const upload of newUploads) {
      try {
        await onFileUpload(upload.file);
        setUploadingFiles(prev => prev.filter(u => u.id !== upload.id));
      } catch (error) {
        setUploadingFiles(prev => prev.map(u => 
          u.id === upload.id ? { ...u, error: true } : u
        ));
      }
    }
  };

  const removeUpload = (id) => {
    setUploadingFiles(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div className="space-y-8">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-[#7C5CFC]/60 bg-[#7C5CFC]/10'
            : 'border-gray-700/60 hover:border-[#7C5CFC]/40 hover:bg-gray-900/40'
        }`}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi"
        />
        
        <div className="space-y-8">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-[#7C5CFC]/20 to-[#6B4CE6]/10 rounded-3xl flex items-center justify-center mx-auto border border-[#7C5CFC]/30">
              <CloudUpload className="w-12 h-12 text-[#7C5CFC]" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#7C5CFC]/10 to-[#6B4CE6]/5 rounded-3xl blur-2xl" />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white mb-3">
              Upload your study materials
            </h3>
            <p className="text-gray-400 text-lg">
              Drag and drop files here, or click to select
            </p>
          </div>
          
          <div className="text-sm text-gray-500 font-medium">
            Supports PDF, Word docs, images, videos, and text files
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-4">
          {uploadingFiles.map((upload) => (
            <motion.div
              key={upload.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-6 bg-gray-800/60 border border-gray-700/50 rounded-2xl backdrop-blur-sm"
            >
              <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {upload.name}
                </p>
                <div className="w-full bg-gray-700/50 rounded-full h-2 mt-3">
                  <div 
                    className="bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE6] h-2 rounded-full transition-all duration-300"
                    style={{ width: upload.error ? '100%' : '60%' }}
                  />
                </div>
              </div>
              <button
                onClick={() => removeUpload(upload.id)}
                className="p-2 hover:bg-gray-700/60 rounded-xl transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContentTable({ contents }) {
  if (contents.length === 0) {
    return (
      <div className="text-center py-20">
        <FileText className="w-20 h-20 text-gray-600 mx-auto mb-8" />
        <p className="text-gray-400 text-xl">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-3xl overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-700/50">
        <h3 className="text-2xl font-bold text-white">
          Uploaded Documents
        </h3>
      </div>
      
      <div className="divide-y divide-gray-700/50">
        {contents.map((content, index) => {
          const Icon = fileIcons[content.mime_type] || File;
          
          return (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-6 p-8 hover:bg-gray-800/40 transition-colors"
            >
              <div className="w-14 h-14 bg-gray-800/60 rounded-2xl flex items-center justify-center flex-shrink-0 border border-gray-700/50">
                <Icon className="w-6 h-6 text-gray-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate mb-2">
                  {content.title}
                </h4>
                <p className="text-xs text-gray-400 font-medium">
                  Uploaded {dayjs(content.created_at).fromNow()}
                </p>
              </div>
              
              <StatusChip status={content.status || 'processed'} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function DocumentsTab() {
  const { space } = useOutletContext();
  const { user_id } = useAuthStore();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const fetchContents = async () => {
    try {
      const data = await api.getSpaceContents(space.id);
      setContents(data || []);
    } catch (error) {
      showToast('error', 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      const tempContent = {
        id: Math.random().toString(36).substr(2, 9),
        title: file.name,
        status: 'processing',
        created_at: new Date().toISOString(),
        mime_type: file.type,
      };
      setContents(prev => [tempContent, ...prev]);

      await api.uploadContent(space.id, file.name, user_id, file);
      
      setTimeout(() => {
        fetchContents();
      }, 2000);
      
      showToast('success', 'Document uploaded successfully');
    } catch (error) {
      showToast('error', 'Failed to upload document');
      setContents(prev => prev.filter(c => c.id !== tempContent.id));
    }
  };

  useEffect(() => {
    fetchContents();
  }, [space.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      const hasProcessing = contents.some(c => c.status === 'processing');
      if (hasProcessing) {
        fetchContents();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [contents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0A0A0A]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#7C5CFC] to-[#6B4CE6] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto p-8 space-y-12">
        <UploadDropzone onFileUpload={handleFileUpload} />
        <ContentTable contents={contents} />
      </div>

      <Toast
        isVisible={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}