import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ isProvider, light }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('provider');
    navigate('/');
  };

  const bg = light ? '#FEFEFE' : '#0F0F0F';
  const border = light ? '1px solid #0F0F0F11' : '1px solid #FEFEFE11';
  const textPrimary = light ? '#0F0F0F' : '#FEFEFE';
  const textMuted = light ? '#0F0F0F66' : '#FEFEFE66';

  return (
    <nav
      className="w-full px-6 py-4 flex items-center justify-between"
      style={{ backgroundColor: bg, borderBottom: border }}
    >
      <Link
        to="/"
        className="text-base font-medium tracking-tight"
        style={{ fontFamily: 'Cormorant, serif', fontSize: '1.25rem', color: textPrimary }}
      >
        OnboardKit
      </Link>
      <div className="flex items-center gap-4">
        {isProvider ? (
          <>
            <Link
              to="/dashboard"
              className="text-sm transition"
              style={{ color: textMuted }}
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm transition"
              style={{ color: textMuted }}
            >
              Log out
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="text-sm px-4 py-2 rounded-lg font-medium transition"
            style={{ backgroundColor: '#6CE9FE', color: '#0F0F0F' }}
          >
            Provider login
          </Link>
        )}
      </div>
    </nav>
  );
}