import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
};

const colors = {
  success: 'bg-green-900/80 border-green-700/50 text-green-300',
  error: 'bg-red-900/80 border-red-700/50 text-red-300',
  warning: 'bg-amber-900/80 border-amber-700/50 text-amber-300',
};

export default function Toast({ isVisible, type = 'success', message, onClose, duration = 5000 }) {
  const Icon = icons[type];

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <div className={`${colors[type]} rounded-2xl border shadow-2xl p-6 pr-16 max-w-sm backdrop-blur-xl`}>
            <div className="flex items-start space-x-4">
              <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-1 hover:bg-black/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}