import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ isProvider }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('provider');
    navigate('/');
  };

  return (
    <nav className="w-full border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-lg font-semibold text-gray-900 tracking-tight">
        OnboardKit
      </Link>
      <div className="flex items-center gap-4">
        {isProvider ? (
          <>
            <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Log out
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Provider login
          </Link>
        )}
      </div>
    </nav>
  );
}