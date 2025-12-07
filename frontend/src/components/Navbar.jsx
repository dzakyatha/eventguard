import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md mb-8 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
          🛡️ EventGuard
        </Link>
        
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <div className="hidden md:flex gap-4 mr-4 border-r pr-4 border-gray-300">
                <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium">
                  Dashboard
                </Link>
                {user.role === 'client' && (
                  <Link to="/search" className="text-gray-600 hover:text-indigo-600 font-medium">
                    🔍 Cari Vendor
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-4">
                <Link to="/profile" className="text-right hidden sm:block group cursor-pointer">
                  <p className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;