import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/theme';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full p-1 transition-all duration-300 border"
      style={{
        backgroundColor: isDark ? 'rgba(55, 65, 81, 0.6)' : 'rgba(229, 231, 235, 0.6)',
        borderColor: isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)'
      }}
    >
      <motion.div
        className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
        style={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff'
        }}
        animate={{
          x: isDark ? 0 : 24,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-gray-400" />
        ) : (
          <Sun className="w-3 h-3 text-yellow-500" />
        )}
      </motion.div>
    </button>
  );
}
</parameter>