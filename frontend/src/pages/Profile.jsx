import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorDetails, setVendorDetails] = useState(null);

  const profileImg = user.role === 'vendor' 
    ? `/images/vendor_${user.id}_profile.jpg` 
    : `https://ui-avatars.com/api/?name=${user.username}&background=0D8ABC&color=fff&size=128`;
  const headerImg = user.role === 'vendor' ? `/images/vendor_${user.id}_header.jpg` : null;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const resProjects = await client.get(ENDPOINTS.PROJECTS.LIST);
        setProjects(resProjects.data);
        if (user.role === 'vendor') {
            try {
                const resVendor = await client.get(ENDPOINTS.VENDORS.DETAIL(user.id));
                setVendorDetails(resVendor.data);
            } catch (err) { console.log("Gagal ambil detail vendor", err); }
        }
      } catch (error) { console.error("Error:", error); } 
      finally { setLoading(false); }
    };
    fetchProjects();
  }, [user]);

  const VerifiedIcon = () => <svg className="w-6 h-6 text-blue-500 inline-block ml-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>;

  // ==========================================
  // A. TAMPILAN KHUSUS VENDOR (HEADER BARU)
  // ==========================================
  const VendorView = () => (
    <div className="max-w-5xl mx-auto mt-6 mb-10 font-sans">
      
      {/* 1. Header & Identitas Dasar */}
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden mb-6">
        {/* Banner Image */}
        <div className="h-48 bg-gray-300 relative">
            {headerImg ? <img src={headerImg} className="w-full h-full object-cover" onError={(e)=>e.target.style.display='none'}/> : <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-purple-600"></div>}
            <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                🕒 Operasional: 09:00 - 21:00 WIB
            </div>
        </div>
        
        {/* INFO WRAPPER: items-start agar bisa kontrol margin atas teks */}
        <div className="px-8 pb-6 relative flex flex-col md:flex-row items-start -mt-16 md:-mt-12 gap-6">
            
            {/* Foto Profil */}
            <img 
                src={profileImg} 
                className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg bg-white object-cover z-10" 
                onError={(e)=>e.target.src=`https://ui-avatars.com/api/?name=${user.username}`} 
            />
            
            {/* Teks Identitas */}
            <div className="flex-1 mt-16 md:mt-14 w-full"> {/* mt-14 mendorong teks pas ke bawah garis banner */}
                <div className="flex justify-between items-start">
                    
                    {/* KIRI: Nama & Username */}
                    <div>
                        {/* Nama Vendor (H1) */}
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center leading-none mb-1">
                            {vendorDetails?.vendor_name || user.username} 
                            <VerifiedIcon />
                        </h1>

                        {/* Username (Subtitle Baru) */}
                        <p className="text-indigo-600 font-bold text-sm mb-1">
                            @{user.username}
                        </p>

                        {/* Kategori */}
                        <p className="text-gray-500 font-medium text-sm">
                            {vendorDetails?.category || 'Professional Event Vendor'}
                        </p>

                        {/* Badges */}
                        <div className="flex gap-2 mt-3 text-xs">
                            <span className="bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200 font-semibold">✔ Identitas</span>
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200 font-semibold">✔ NIB Legal</span>
                            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-200 font-semibold">✔ CHSE Certified</span>
                        </div>
                    </div>

                    {/* KANAN: Rating */}
                    <div className="text-right hidden md:block">
                        <div className="text-3xl font-bold text-gray-800">4.9 <span className="text-base text-gray-400 font-normal">/ 5.0</span></div>
                        <div className="text-yellow-500 text-sm">⭐⭐⭐⭐⭐ (127 Reviews)</div>
                        <p className="text-xs text-green-600 font-bold mt-1">98% On-Time Completion</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Grid Content Bawah (Tetap Sama) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 text-lg mb-4 border-b pb-2">⚙️ Kapabilitas & Spesifikasi</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-gray-400 text-xs uppercase font-bold">Crew Capacity</p><p className="font-semibold text-gray-700">15 - 50 Staff Professional</p></div>
                    <div><p className="text-gray-400 text-xs uppercase font-bold">Max Event Size</p><p className="font-semibold text-gray-700">Up to 10.000 Pax</p></div>
                    <div><p className="text-gray-400 text-xs uppercase font-bold">Coverage Area</p><p className="font-semibold text-gray-700">Bandung, Jakarta, Bekasi</p></div>
                    <div><p className="text-gray-400 text-xs uppercase font-bold">Equipment Highlight</p><p className="font-semibold text-gray-700">JBL Vertec, LED P3, Sony FX3</p></div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 text-lg mb-4 border-b pb-2">📦 Paket Layanan</h3>
                <div className="space-y-3">
                    {['Basic Event Support (Rp 5jt)', 'Full Wedding Organizer (Rp 25jt)', 'Corporate Concert (Custom)'].map((pkg, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <span className="font-medium text-gray-700">{pkg}</span>
                            <span className="text-indigo-600 text-sm font-bold">Lihat Detail →</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 text-lg mb-4 border-b pb-2">📂 Riwayat Proyek</h3>
                <table className="w-full text-sm text-left">
                    <thead className="text-gray-500 bg-gray-50 uppercase text-xs">
                        <tr><th className="p-3">Tanggal</th><th className="p-3">Nama Event</th><th className="p-3">Status</th></tr>
                    </thead>
                    <tbody>
                        {projects.length > 0 ? projects.map(p => (
                            <tr key={p.id} className="border-b last:border-0">
                                <td className="p-3 text-gray-500">{p.event_date}</td>
                                <td className="p-3 font-medium text-gray-800">{p.name}</td>
                                <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span></td>
                            </tr>
                        )) : <tr><td colSpan="3" className="p-4 text-center text-gray-400">Belum ada proyek</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3">📅 Ketersediaan</h3>
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="font-bold text-green-700">Available This Week</span>
                </div>
                <p className="text-xs text-gray-500">Vendor ini responsif dan siap menerima brief baru.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3">📜 Kebijakan Bisnis</h3>
                <ul className="text-sm space-y-2 text-gray-600">
                    <li>🔄 <strong>Revisi:</strong> 2x Minor Free</li>
                    <li>💸 <strong>Refund:</strong> 50% jika H-30</li>
                    <li>⏱ <strong>Overtime:</strong> Rp 500rb/jam</li>
                    <li>🚚 <strong>Travel:</strong> Ditanggung Client</li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );

  const ClientView = () => (
    <div className="max-w-4xl mx-auto mt-6 mb-10 font-sans">
        <div className="bg-white shadow-lg rounded-2xl p-8 flex items-center gap-6 mb-6">
            <div className="relative">
                <img src={profileImg} className="w-24 h-24 rounded-full border-4 border-indigo-50" onError={(e)=>e.target.src=`https://ui-avatars.com/api/?name=${user.username}`} />
                <div className="absolute bottom-0 right-0 bg-green-500 border-2 border-white w-6 h-6 rounded-full" title="Online"></div>
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border border-gray-200 font-bold uppercase">Corporate Client</span>
                </div>
                <p className="text-gray-500 text-sm mt-1">Bergabung sejak Desember 2025 • Jakarta Selatan</p>
                <div className="flex gap-4 mt-3">
                    <span className="text-xs flex items-center gap-1 text-green-700 font-bold bg-green-50 px-2 py-1 rounded">✔ Email Verified</span>
                    <span className="text-xs flex items-center gap-1 text-green-700 font-bold bg-green-50 px-2 py-1 rounded">✔ Phone Verified</span>
                    <span className="text-xs flex items-center gap-1 text-blue-700 font-bold bg-blue-50 px-2 py-1 rounded">💳 Payment Connected</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 text-lg mb-4 border-b pb-2">🗂️ Riwayat Proyek</h3>
                    {projects.length > 0 ? (
                        <div className="space-y-4">
                            {projects.map(p => (
                                <div key={p.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                                    <div><p className="font-bold text-gray-800">{p.name}</p><p className="text-xs text-gray-500">{p.event_date}</p></div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.status === 'ACTIVE' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>{p.status}</span>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-400 text-center py-4">Belum ada riwayat proyek.</p>}
                </div>
            </div>
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">💎 Reputasi Client</h3>
                    <div className="space-y-4">
                        <div><div className="flex justify-between text-sm mb-1"><span>Komunikasi</span><span className="font-bold text-indigo-600">5.0</span></div><div className="h-2 bg-gray-200 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{width: '100%'}}></div></div></div>
                        <div><div className="flex justify-between text-sm mb-1"><span>Kejelasan Brief</span><span className="font-bold text-indigo-600">4.8</span></div><div className="h-2 bg-gray-200 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{width: '96%'}}></div></div></div>
                        <div><div className="flex justify-between text-sm mb-1"><span>Pembayaran</span><span className="font-bold text-green-600">Excellent</span></div><div className="h-2 bg-gray-200 rounded-full"><div className="h-full bg-green-500 rounded-full" style={{width: '100%'}}></div></div></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  if (loading) return <div className="p-10 text-center">Memuat profil...</div>;
  return user.role === 'vendor' ? <VendorView /> : <ClientView />;
};

export default Profile;