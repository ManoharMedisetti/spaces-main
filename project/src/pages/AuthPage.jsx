import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { api } from '../api';
import Toast from '../components/Toast';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
  });
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const { isAuthenticated, login } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const handleSkipLogin = () => {
    // Create a mock user session for development
    const mockUserData = {
      access_token: 'mock-token-' + Date.now(),
      user_id: 'demo-user-123',
      full_name: 'Demo User',
      email: 'demo@tutorwise.com',
    };
    
    login(mockUserData);
    showToast('success', 'Logged in as demo user');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === 'login') {
        const response = await api.login({
          email: formData.email,
          password: formData.password,
        });
        login(response);
        showToast('success', 'Welcome back!');
      } else {
        const response = await api.register({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
        });
        login(response);
        showToast('success', 'Account created successfully!');
      }
    } catch (error) {
      showToast('error', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#7C5CFC] to-[#6B4CE6] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#7C5CFC]/30">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-br from-[#7C5CFC]/20 to-[#6B4CE6]/20 rounded-3xl blur-xl -z-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-3">
            TutorWise Spaces
          </h1>
          <p className="text-gray-400 text-lg font-medium">Your intelligent learning workspace</p>
        </div>

        {/* Skip Login Button */}
        <div className="mb-8">
          <button
            onClick={handleSkipLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 text-sm font-semibold text-[#7C5CFC] bg-[#7C5CFC]/10 hover:bg-[#7C5CFC]/20 rounded-2xl transition-all border border-[#7C5CFC]/30 group"
          >
            <span>Continue as Demo User</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#0A0A0A] text-gray-500 font-medium">or sign in with your account</span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden mt-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex bg-gray-800/50 border-b border-gray-700/50">
            {['login', 'register'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 text-sm font-semibold transition-all relative ${
                  activeTab === tab
                    ? 'text-white bg-gray-900/80'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }`}
              >
                {tab === 'login' ? 'Sign In' : 'Sign Up'}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C5CFC]"
                    initial={false}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {activeTab === 'register' && (
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-semibold text-gray-200 mb-3">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-gray-800/60 border border-gray-700/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/30 focus:border-[#7C5CFC]/50 transition-all text-gray-100 placeholder-gray-500"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-gray-800/60 border border-gray-700/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/30 focus:border-[#7C5CFC]/50 transition-all text-gray-100 placeholder-gray-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-200 mb-3">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 pr-12 bg-gray-800/60 border border-gray-700/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/30 focus:border-[#7C5CFC]/50 transition-all text-gray-100 placeholder-gray-500"
                      placeholder="Enter your password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-700/60 rounded-xl transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
              </motion.div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE6] hover:from-[#8B6BFF] hover:to-[#7C5CFC] disabled:from-gray-700 disabled:to-gray-700 text-white rounded-2xl transition-all font-semibold"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {activeTab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
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