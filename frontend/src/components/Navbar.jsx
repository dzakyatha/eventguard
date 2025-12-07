import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- IKON SVG (NAVBAR SET) ---
const NavIcons = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    // Gunakan warna border Navy (#251E3B) dengan opacity rendah agar elegan
    <nav className="bg-white border-b border-[#251E3B]/10 sticky top-0 z-50 h-20 flex items-center">
      <div className="container mx-auto px-6 lg:px-8 flex justify-between items-center w-full">
        
        {/* LOGO SECTION */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img 
            src="/images/logo_long.png" 
            alt="EventGuard Logo" 
            className="h-8 w-auto" // Ukuran logo proporsional
          />
        </Link>
        
        <div className="flex items-center gap-8">
          {user ? (
            <>
              {/* NAVIGATION LINKS */}
              <div className="hidden md:flex items-center gap-6 mr-4 border-r border-gray-200 pr-6 h-8">
                
                <Link to="/dashboard" className="flex items-center gap-2 text-[#251E3B]/70 hover:text-[#FF9206] font-semibold transition-colors text-sm">
                  <NavIcons.Dashboard />
                  Dashboard
                </Link>

                {user.role === 'client' && (
                  <Link to="/search" className="flex items-center gap-2 text-[#251E3B]/70 hover:text-[#FF9206] font-semibold transition-colors text-sm">
                    <NavIcons.Search />
                    Cari Vendor
                  </Link>
                )}
              </div>

              {/* USER PROFILE & LOGOUT */}
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-3 group cursor-pointer">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-[#251E3B] group-hover:text-[#FF9206] transition-colors leading-none">
                      {user.username}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                      {user.role}
                    </p>
                  </div>
                  {/* Avatar Mini (Fallback Icon) */}
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 group-hover:border-[#FF9206] transition-colors">
                     <img 
                        src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.style.display = 'none'} // Hide if error, show icon below
                     />
                  </div>
                </Link>

                <button 
                  onClick={handleLogout}
                  className="bg-red-50 text-red-500 p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center gap-2 text-xs font-bold"
                  title="Logout"
                >
                  <NavIcons.Logout />
                  <span className="hidden lg:inline">Keluar</span>
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="px-6 py-2.5 bg-[#FF9206] text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all">
              Login Masuk
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;