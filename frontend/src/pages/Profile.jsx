import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const Profile = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorDetails, setVendorDetails] = useState(null);

  // Gambar Profil (Logika sama dengan VendorCard)
  // Jika Client, kita pakai avatar default. Jika Vendor, coba cari gambar lokal.
  const profileImg = user.role === 'vendor' 
    ? `/images/vendor_${user.id}_profile.jpg` 
    : `https://ui-avatars.com/api/?name=${user.username}&background=0D8ABC&color=fff&size=128`;
    
  const headerImg = user.role === 'vendor'
    ? `/images/vendor_${user.id}_header.jpg`
    : null; // Client pakai gradient saja

    const VerifiedIcon = () => (
        <svg className="w-8 h-8 text-blue-500 ml-2 inline-block" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
        </svg>
    );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ambil Data Proyek untuk Statistik
        const resProjects = await client.get(ENDPOINTS.PROJECTS.LIST);
        setProjects(resProjects.data);

        // 2. Jika Vendor, ambil detail tambahan (Rating, Lokasi, dll)
        if (user.role === 'vendor') {
            try {
                const resVendor = await client.get(ENDPOINTS.VENDORS.DETAIL(user.id));
                setVendorDetails(resVendor.data);
            } catch (err) {
                console.log("Gagal ambil detail vendor", err);
            }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // --- HITUNG STATISTIK ---
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'ACTIVE' || p.status === 'READY_TO_SIGN').length;
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length; // Asumsi ada status completed nanti
  
  // Hitung Total Nilai Proyek (Hanya yang sudah disetujui/Active)
  const totalValue = projects
    .filter(p => p.status !== 'BRIEF')
    .reduce((acc, curr) => acc + (curr.budget_limit || 0), 0);

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        
        {/* === HEADER BANNER === */}
        <div className="h-48 bg-gray-300 relative">
            {headerImg ? (
                <img 
                    src={headerImg} 
                    className="w-full h-full object-cover" 
                    onError={(e) => e.target.style.display = 'none'} // Sembunyikan jika error
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            )}
        </div>

        {/* === INFO UTAMA === */}
        <div className="px-8 pb-8 relative">
            {/* Avatar */}
            <div className="absolute -top-16 left-8">
                <img 
                    src={profileImg} 
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white object-cover"
                    onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${user.username}`}
                />
            </div>

            {/* Teks Nama & Role */}
            <div className="pt-20 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 capitalize">
                        {vendorDetails?.vendor_name || user.username}
                        <VerifiedIcon />
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                            {user.role}
                        </span>
                        {vendorDetails?.location && (
                            <span className="text-gray-500 text-sm flex items-center gap-1">
                                📍 {vendorDetails.location}
                            </span>
                        )}
                    </div>
                    {vendorDetails?.description && (
                        <p className="mt-4 text-gray-600 max-w-2xl">{vendorDetails.description}</p>
                    )}
                </div>

                {/* Rating (Khusus Vendor) */}
                {user.role === 'vendor' && (
                    <div className="text-center bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                        <span className="block text-3xl">⭐ {vendorDetails?.rating || 'N/A'}</span>
                        <span className="text-xs text-yellow-700 font-bold uppercase">Rating Pelanggan</span>
                    </div>
                )}
            </div>

            {/* === STATISTIK DASHBOARD === */}
            <div className="mt-10">
                <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Statistik Aktivitas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl text-center">
                        <span className="block text-2xl font-bold text-blue-700">{totalProjects}</span>
                        <span className="text-xs text-blue-600 uppercase font-bold">Total Proyek</span>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl text-center">
                        <span className="block text-2xl font-bold text-green-700">{activeProjects}</span>
                        <span className="text-xs text-green-600 uppercase font-bold">Proyek Aktif</span>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl text-center">
                        <span className="block text-2xl font-bold text-purple-700">Rp {(totalValue/1000000).toFixed(1)} Jt</span>
                        <span className="text-xs text-purple-600 uppercase font-bold">Nilai Transaksi</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <span className="block text-2xl font-bold text-gray-700">#{user.id}</span>
                        <span className="text-xs text-gray-500 uppercase font-bold">User ID</span>
                    </div>
                </div>
            </div>

            {/* === INFORMASI AKUN (READ ONLY) === */}
            <div className="mt-10">
                <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Informasi Akun</h3>
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Username</label>
                        <div className="p-3 bg-gray-50 rounded border border-gray-200 text-gray-700 font-medium">{user.username}</div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;