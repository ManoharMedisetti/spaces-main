import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronRight, FileText, User, Bot, X, CornerDownLeft, Zap } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { api } from '../api';
import Toast from '../components/Toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

function ContextDrawer({ isOpen, onClose, context }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-gray-900/95 dark:bg-gray-900/95 light:bg-white/95 backdrop-blur-xl border-l border-gray-700/50 dark:border-gray-700/50 light:border-gray-200/50 z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-8 border-b border-gray-700/50 dark:border-gray-700/50 light:border-gray-200/50">
              <h3 className="text-xl font-bold text-white dark:text-white light:text-gray-900">
                Source Context
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800/60 dark:hover:bg-gray-800/60 light:hover:bg-gray-100/60 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-400 dark:text-gray-400 light:text-gray-600" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {context && context.length > 0 ? (
                context.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-800/60 dark:bg-gray-800/60 light:bg-gray-50/60 border border-gray-700/50 dark:border-gray-700/50 light:border-gray-200/50 rounded-2xl p-6"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <FileText className="w-5 h-5 text-[#7C5CFC] mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white dark:text-white light:text-gray-900 truncate">
                          {item.source || 'Document'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 mt-1">
                          Page {item.page || 1}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-700 leading-relaxed">
                      {item.content || item.text}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-600 dark:text-gray-600 light:text-gray-400 mx-auto mb-6" />
                  <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-lg">No context sources for this message</p>
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
      className={`flex gap-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-12 h-12 bg-gradient-to-br from-[#7C5CFC]/20 to-[#6B4CE6]/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-[#7C5CFC]/30">
          <Zap className="w-5 h-5 text-[#7C5CFC]" />
        </div>
      )}
      
      <div className={`max-w-3xl ${isUser ? 'order-first' : ''}`}>
        <div
          className={`rounded-3xl px-8 py-6 ${
            isUser
              ? 'bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE6] text-white ml-auto shadow-lg shadow-[#7C5CFC]/25'
              : 'bg-gray-800/60 dark:bg-gray-800/60 light:bg-gray-50/60 border border-gray-700/50 dark:border-gray-700/50 light:border-gray-200/50 text-gray-100 dark:text-gray-100 light:text-gray-900 backdrop-blur-sm'
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <div className="markdown-content text-sm leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        {!isUser && message.context && message.context.length > 0 && (
          <button
            onClick={() => onShowContext(message.context)}
            className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-[#7C5CFC] mt-4 transition-colors font-medium group"
          >
            <FileText className="w-3 h-3" />
            Show Sources ({message.context.length})
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
      
      {isUser && (
        <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 dark:from-gray-700 dark:to-gray-800 light:from-gray-200 light:to-gray-300 rounded-2xl flex items-center justify-center flex-shrink-0 border border-gray-600/50 dark:border-gray-600/50 light:border-gray-300/50">
          <User className="w-5 h-5 text-gray-300 dark:text-gray-300 light:text-gray-600" />
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
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow new line on Shift+Enter
        return;
      } else if (e.metaKey || e.ctrlKey) {
        // Send on Cmd/Ctrl+Enter
        e.preventDefault();
        handleSubmit(e);
      } else {
        // Send on Enter (default behavior)
        e.preventDefault();
        handleSubmit(e);
      }
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
    <div className="sticky bottom-0 bg-[#0A0A0A]/95 dark:bg-[#0A0A0A]/95 light:bg-white/95 backdrop-blur-xl border-t border-gray-800/50 dark:border-gray-800/50 light:border-gray-200/50 p-8">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex gap-4 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your study materials..."
              className="w-full px-6 py-5 pr-20 rounded-3xl border border-gray-700/50 dark:border-gray-700/50 light:border-gray-300/50 focus:border-[#7C5CFC]/50 focus:ring-4 focus:ring-[#7C5CFC]/20 focus:outline-none transition-all duration-200 resize-none min-h-[60px] max-h-[120px] bg-gray-900/80 dark:bg-gray-900/80 light:bg-white/80 backdrop-blur-sm text-gray-100 dark:text-gray-100 light:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500 light:placeholder-gray-400"
              disabled={disabled}
              rows={1}
            />
            <div className="absolute bottom-4 right-6 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 light:text-gray-400">
              <CornerDownLeft className="w-3 h-3" />
              <span>Enter</span>
              <span className="text-gray-600 dark:text-gray-600 light:text-gray-300">•</span>
              <span>⇧ + ↵ new line</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="p-5 bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE6] hover:from-[#8B6BFF] hover:to-[#7C5CFC] disabled:from-gray-700 disabled:to-gray-700 text-white rounded-3xl transition-all duration-200 flex-shrink-0 shadow-lg shadow-[#7C5CFC]/25 hover:shadow-[#7C5CFC]/40 hover:-translate-y-1 disabled:shadow-none disabled:transform-none"
          >
            <Send className="w-5 h-5" />
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
      const history = [...messages, userMessage].slice(-6);
      
      const response = await api.sendMessage({
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
    <div className="flex flex-col h-full bg-[#0A0A0A] dark:bg-[#0A0A0A] light:bg-white">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8 space-y-8">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24"
            >
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-[#7C5CFC]/20 to-[#6B4CE6]/10 rounded-3xl flex items-center justify-center mx-auto border border-[#7C5CFC]/30">
                  <Zap className="w-12 h-12 text-[#7C5CFC]" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#7C5CFC]/10 to-[#6B4CE6]/5 rounded-3xl blur-2xl" />
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-white dark:text-white light:text-gray-900 mb-4">
                Ready to help you learn
              </h2>
              <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-lg max-w-lg mx-auto leading-relaxed">
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
              className="flex gap-6"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#7C5CFC]/20 to-[#6B4CE6]/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-[#7C5CFC]/30">
                <Zap className="w-5 h-5 text-[#7C5CFC]" />
              </div>
              <div className="bg-gray-800/60 dark:bg-gray-800/60 light:bg-gray-50/60 border border-gray-700/50 dark:border-gray-700/50 light:border-gray-200/50 rounded-3xl px-8 py-6 backdrop-blur-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#7C5CFC] rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[#7C5CFC] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-[#7C5CFC] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
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