import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar'; 
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VendorSearch from './pages/VendorSearch';
import ProjectBrief from './pages/ProjectBrief';
import SignMoU from './pages/SignMoU';
import Profile from './pages/Profile';

// Komponen Wrapper untuk mengatur Logika Tampilan
const AppContent = () => {
  const location = useLocation();
  
  // Daftar halaman yang TIDAK boleh ada Navbar
  const noNavbarRoutes = ['/login', '/register'];
  
  // Cek apakah halaman saat ini ada di daftar tersebut
  const showNavbar = !noNavbarRoutes.includes(location.pathname);

  return (
    <>
      {/* Navbar hanya muncul jika showNavbar = true */}
      {showNavbar && <Navbar />}
      
      {/* Container utama */}
      <div className={showNavbar ? "pt-0" : ""}> 
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Halaman yang butuh Login */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search" element={<VendorSearch />} />
            <Route path="/create-brief/:vendorId" element={<ProjectBrief />} />
            <Route path="/sign-mou/:projectId" element={<SignMoU />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          {/* Default redirect ke dashboard atau login */}
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;