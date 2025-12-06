import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Pastikan import ini
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Import pages...
import Login from './pages/Login';
import VendorSearch from './pages/VendorSearch';
import ProjectBrief from './pages/ProjectBrief';
import Dashboard from './pages/Dashboard';
import SignMoU from './pages/SignMoU';

function App() {
    return (
        <Router> 
        <AuthProvider>
            <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <Navbar />
            <div className="container mx-auto px-4 py-6">
                <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/search" element={<VendorSearch />} />
                    <Route path="/create-brief/:vendorId" element={<ProjectBrief />} />
                    <Route path="/sign-mou/:projectId" element={<SignMoU />} />
                </Route>
                </Routes>
            </div>
            </div>
        </AuthProvider>
        </Router>
    );
}

export default App;