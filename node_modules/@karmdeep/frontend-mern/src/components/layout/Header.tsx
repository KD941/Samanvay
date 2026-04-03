import { Bell, User, LogOut, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuthStore();
  const { mode, toggle } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-20 bg-[var(--surface)] shadow-[0_4px_16px_var(--shadow-dark)] flex items-center justify-between px-6 z-10 sticky top-0 transition-colors duration-500">
      <div className="flex-1" />

      <div className="flex items-center space-x-4">
        <button
          type="button"
          aria-label="Toggle theme"
          title={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={toggle}
          className="btn-secondary p-3 rounded-2xl flex items-center justify-center transition-all duration-300"
        >
          {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
        </button>

        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          className="btn-secondary p-3 rounded-2xl flex items-center justify-center transition-all duration-300"
        >
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-4 pl-6 border-l border-gray-300 dark:border-gray-700">
          <div className="text-right leading-tight hidden sm:block">
            <p className="text-sm font-bold text-[var(--text)] max-w-xs truncate">{user?.name || user?.email}</p>
            <p className="text-xs text-[var(--muted)]">{user?.role}</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              aria-label="User Profile"
              title="User profile"
              className="btn-secondary p-3 rounded-2xl flex items-center justify-center transition-all duration-300"
            >
              <User className="w-5 h-5" />
            </button>

            <button
              type="button"
              aria-label="Logout"
              title="Logout"
              onClick={handleLogout}
              className="p-3 rounded-2xl bg-[var(--surface)] text-red-500 shadow-[var(--shadow)] active:shadow-[var(--shadow-inset)] hover:text-red-600 hover:-translate-y-0.5 transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
