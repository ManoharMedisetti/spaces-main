import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/theme';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 bg-gray-800/60 dark:bg-gray-700/60 light:bg-gray-200/60 rounded-full p-1 transition-all duration-300 hover:bg-gray-700/80 dark:hover:bg-gray-600/80 light:hover:bg-gray-300/80 border border-gray-700/50 dark:border-gray-600/50 light:border-gray-300/50"
    >
      <motion.div
        className="w-6 h-6 bg-white dark:bg-gray-900 light:bg-gray-900 rounded-full flex items-center justify-center shadow-lg"
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
          <Moon className="w-3 h-3 text-gray-600" />
        ) : (
          <Sun className="w-3 h-3 text-yellow-500" />
        )}
      </motion.div>
    </button>
  );
}