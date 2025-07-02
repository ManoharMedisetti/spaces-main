import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronRight, FileText, User, Bot, X } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { apiService } from '../api'; // replaced hard-coded URL
import Toast from '../components/Toast';

function ContextDrawer({ isOpen, onClose, context }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                Source Context
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {context && context.length > 0 ? (
                context.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-50 rounded-xl p-4 border border-slate-200"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <FileText className="w-4 h-4 text-slate-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {item.source || 'Document'}
                        </p>
                        <p className="text-xs text-slate-500">
                          Page {item.page || 1}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {item.content || item.text}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No context sources for this message</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ChatMessage({ message, onShowContext }) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-violet-600" />
        </div>
      )}
      
      <div className={`max-w-2xl ${isUser ? 'order-first' : ''}`}>
        <div
          className={`rounded-2xl px-6 py-4 ${
            isUser
              ? 'bg-violet-600 text-white ml-auto'
              : 'bg-white border border-slate-200 shadow-sm'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        
        {!isUser && message.context && message.context.length > 0 && (
          <button
            onClick={() => onShowContext(message.context)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-violet-600 mt-2 transition-colors"
          >
            <FileText className="w-3 h-3" />
            Show Sources ({message.context.length})
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-slate-600" />
        </div>
      )}
    </motion.div>
  );
}

function ChatInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  return (
    <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-slate-200/60 p-6">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex gap-4 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your study materials..."
              className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors resize-none min-h-[48px] max-h-[120px]"
              disabled={disabled}
              rows={1}
            />
            <div className="absolute bottom-3 right-3 text-xs text-slate-400">
              ⌘ + Enter
            </div>
          </div>
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="p-3 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 text-white rounded-xl transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ChatTab() {
  const { space } = useOutletContext();
  const { user_id } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contextDrawer, setContextDrawer] = useState({ isOpen: false, context: null });
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const messagesEndRef = useRef(null);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message) => {
    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // Get last 6 messages for context
      const history = [...messages, userMessage].slice(-6);
      
      const response = await apiService.sendMessage({ // replaced hard-coded URL
        user_id,
        space_id: space.id,
        message,
        history: history.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.answer,
        context: response.context || [],
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      showToast('error', 'Failed to send message. Please try again.');
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleShowContext = (context) => {
    setContextDrawer({ isOpen: true, context });
  };

  const handleCloseContext = () => {
    setContextDrawer({ isOpen: false, context: null });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8 space-y-6">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="w-8 h-8 text-violet-600" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-3">
                Ready to help you learn
              </h2>
              <p className="text-slate-600 max-w-md mx-auto">
                Ask questions about your uploaded materials and I'll provide answers with relevant context from your documents.
              </p>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                onShowContext={handleShowContext}
              />
            ))
          )}
          
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-violet-600" />
              </div>
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-6 py-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <ChatInput onSendMessage={handleSendMessage} disabled={loading} />

      {/* Context Drawer */}
      <ContextDrawer
        isOpen={contextDrawer.isOpen}
        onClose={handleCloseContext}
        context={contextDrawer.context}
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