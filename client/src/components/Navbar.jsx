import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { t } from '../utils/theme';

export default function Navbar({ isProvider }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const c = t(theme);

  let loggedIn = false;
  try {
    const stored = localStorage.getItem('provider') || sessionStorage.getItem('provider');
    loggedIn = isProvider || !!stored;
  } catch (e) {
    loggedIn = isProvider || false;
  }

  const handleLogout = () => {
    localStorage.removeItem('provider');
    sessionStorage.removeItem('provider');
    navigate('/');
  };

  return (
    <nav
      className="w-full px-6 py-4 flex items-center justify-between"
      style={{ backgroundColor: c.navBg, borderBottom: `1px solid ${c.navBorder}` }}
    >
      <Link
        to="/"
        style={{ fontFamily: 'Cormorant, serif', fontSize: '1.25rem', color: c.textPrimary }}
      >
        OnboardKit
      </Link>

      <div className="flex items-center gap-3">
        {loggedIn ? (
          <>
            <Link
              to="/dashboard"
              className="text-sm transition"
              style={{ color: c.textMuted }}
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm transition"
              style={{ color: c.textMuted }}
            >
              Log out
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="text-sm px-4 py-2 rounded-lg font-medium transition"
            style={{ backgroundColor: c.accent, color: c.accentFg }}
          >
            Provider login
          </Link>
        )}

        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition"
          style={{ backgroundColor: c.bgCard, border: `1px solid ${c.border}` }}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <svg className="w-4 h-4" fill="none" stroke={c.textSecondary} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke={c.textSecondary} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
}