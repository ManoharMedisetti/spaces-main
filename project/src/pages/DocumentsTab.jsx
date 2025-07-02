import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, File, Image, Video, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { apiService } from '../api'; // replaced hard-coded URL
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
  processing: { icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200', label: 'Processing' },
  processed: { icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200', label: 'Ready' },
  failed: { icon: AlertCircle, color: 'text-red-600 bg-red-50 border-red-200', label: 'Failed' },
};

function StatusChip({ status }) {
  const config = statusConfig[status] || statusConfig.processing;
  const Icon = config.icon;
  
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
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
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          isDragOver
            ? 'border-violet-400 bg-violet-50'
            : 'border-slate-300 hover:border-violet-400 hover:bg-slate-50'
        }`}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi"
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8 text-violet-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">
              Upload your study materials
            </h3>
            <p className="text-slate-600 mt-1">
              Drag and drop files here, or click to select
            </p>
          </div>
          
          <div className="text-xs text-slate-500">
            Supports PDF, Word docs, images, videos, and text files
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((upload) => (
            <motion.div
              key={upload.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200"
            >
              <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {upload.name}
                </p>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-violet-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: upload.error ? '100%' : '60%' }}
                  />
                </div>
              </div>
              <button
                onClick={() => removeUpload(upload.id)}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
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
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200/60">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">
          Uploaded Documents
        </h3>
      </div>
      
      <div className="divide-y divide-slate-200/60">
        {contents.map((content, index) => {
          const Icon = fileIcons[content.mime_type] || File;
          
          return (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-6 hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-slate-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-slate-900 truncate">
                  {content.title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
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
      const data = await apiService.getSpaceContents(space.id); // replaced hard-coded URL
      setContents(data || []);
    } catch (error) {
      showToast('error', 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      // Add optimistic update
      const tempContent = {
        id: Math.random().toString(36).substr(2, 9),
        title: file.name,
        status: 'processing',
        created_at: new Date().toISOString(),
        mime_type: file.type,
      };
      setContents(prev => [tempContent, ...prev]);

      await apiService.uploadContent(space.id, file.name, user_id, file); // replaced hard-coded URL
      
      // Poll for updates
      setTimeout(() => {
        fetchContents();
      }, 2000);
      
      showToast('success', 'Document uploaded successfully');
    } catch (error) {
      showToast('error', 'Failed to upload document');
      // Remove temp content on error
      setContents(prev => prev.filter(c => c.id !== tempContent.id));
    }
  };

  useEffect(() => {
    fetchContents();
  }, [space.id]);

  useEffect(() => {
    // Poll for processing status updates
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
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8 space-y-8">
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