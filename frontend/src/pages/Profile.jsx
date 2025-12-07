import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

// --- IKON SVG (HEROICONS) ---
const Icons = {
  Verified: () => <svg className="w-5 h-5 text-blue-500 ml-1 inline-block" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>,
  Star: () => <svg className="w-4 h-4 text-[#FF9206] inline-block mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  Briefcase: () => <svg className="w-5 h-5 text-[#251E3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Clock: () => <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Check: () => <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Cog: () => <svg className="w-5 h-5 text-[#251E3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Box: () => <svg className="w-5 h-5 text-[#251E3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Folder: () => <svg className="w-5 h-5 text-[#251E3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
  Calendar: () => <svg className="w-5 h-5 text-[#251E3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Document: () => <svg className="w-5 h-5 text-[#251E3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Diamond: () => <svg className="w-5 h-5 text-[#251E3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Target: () => <svg className="w-5 h-5 text-[#251E3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
};

const Profile = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorDetails, setVendorDetails] = useState(null);

  // Avatar Logic (Sama dengan Navbar)
  const profileImg = user.role === 'vendor' 
    ? `/images/vendor_${user.id}_profile.jpg` 
    : `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff&size=128`;
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

  // ==========================================
  // A. TAMPILAN KHUSUS VENDOR
  // ==========================================
  const VendorView = () => (
    <div className="max-w-6xl mx-auto mt-8 mb-10 px-4 font-sans text-[#251E3B]">
      
      {/* 1. Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#251E3B]/5 overflow-hidden mb-8">
        <div className="h-64 relative bg-gray-100">
            {headerImg ? (
                <img src={headerImg} className="w-full h-full object-cover" onError={(e)=>e.target.style.display='none'}/>
            ) : (
                <div className="w-full h-full bg-gradient-to-r from-[#251E3B] to-[#1e1b4b]"></div>
            )}
            <div className="absolute top-6 right-6 bg-white/90 text-[#251E3B] text-xs font-bold px-4 py-2 rounded-full backdrop-blur-md shadow-sm flex items-center">
                <Icons.Clock /> Operasional: 09:00 - 21:00
            </div>
        </div>
        
        <div className="px-10 pb-8 relative flex flex-col md:flex-row items-end -mt-20 md:-mt-16 gap-8">
            
            {/* Foto Profil (Style Navbar: Lingkaran & Fallback) */}
            <div className="shrink-0 p-1 bg-white rounded-full shadow-xl">
                <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                    <img 
                        src={profileImg} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.target.style.display = 'none'; }} 
                    />
                    {/* Fallback Icon jika gambar gagal */}
                    <div className="absolute"><Icons.User /></div>
                </div>
            </div>
            
            <div className="flex-1 pb-2 w-full pt-4 md:pt-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
                    <div>
                        <h1 className="text-4xl font-extrabold text-[#251E3B] flex items-center mb-1">
                            {vendorDetails?.vendor_name || user.username} 
                            <Icons.Verified />
                        </h1>
                        <p className="text-[#FF9206] font-bold text-sm mb-1">@{user.username}</p>
                        <p className="text-gray-500 font-medium text-sm">{vendorDetails?.category || 'Professional Event Vendor'}</p>

                        <div className="flex gap-3 mt-4 text-xs">
                            <span className="flex items-center bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100 font-bold"><Icons.Check /> Identitas</span>
                            <span className="flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 font-bold"><Icons.Check /> NIB Legal</span>
                        </div>
                    </div>

                    <div className="text-right mt-6 md:mt-0">
                        <div className="flex items-center gap-2 justify-end mb-1">
                            <span className="text-4xl font-extrabold text-[#251E3B]">4.9</span>
                            <div className="text-left leading-none">
                                <div className="flex text-[#FF9206] text-xs mb-1">
                                    {[1,2,3,4,5].map(i=><Icons.Star key={i}/>)}
                                </div>
                                <span className="text-xs text-gray-400 font-bold">127 Reviews</span>
                            </div>
                        </div>
                        <p className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded inline-block">98% On-Time Completion</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#251E3B]/5">
                <h3 className="font-bold text-[#251E3B] text-xl mb-6 border-b border-gray-100 pb-4 flex items-center gap-2"><Icons.Cog /> Kapabilitas</h3>
                <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
                    <div><p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Crew Capacity</p><p className="font-bold text-lg text-[#251E3B]">25+ Staff</p></div>
                    <div><p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Max Event Size</p><p className="font-bold text-lg text-[#251E3B]">10.000 Pax</p></div>
                    <div><p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Area</p><p className="font-bold text-lg text-[#251E3B]">Jabodetabek</p></div>
                    <div><p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Equipment</p><p className="font-bold text-lg text-[#251E3B]">JBL Vertec, Sony FX3</p></div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#251E3B]/5">
                <h3 className="font-bold text-[#251E3B] text-xl mb-6 border-b border-gray-100 pb-4 flex items-center gap-2"><Icons.Box /> Paket Layanan</h3>
                <div className="space-y-4">
                    {['Basic Event Support (Rp 5jt)', 'Full Wedding Organizer (Rp 25jt)', 'Corporate Concert (Custom)'].map((pkg, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors">
                            <span className="font-bold text-[#251E3B]">{pkg}</span>
                            <span className="text-[#FF9206] text-sm font-bold flex items-center gap-1">Detail <span className="text-lg">→</span></span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#251E3B]/5">
                <h3 className="font-bold text-[#251E3B] text-xl mb-6 border-b border-gray-100 pb-4 flex items-center gap-2"><Icons.Folder /> Riwayat Proyek</h3>
                <table className="w-full text-sm text-left">
                    <thead className="text-gray-400 font-bold uppercase text-xs">
                        <tr><th className="pb-4">Tanggal</th><th className="pb-4">Nama Event</th><th className="pb-4">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {projects.length > 0 ? projects.map(p => (
                            <tr key={p.id}>
                                <td className="py-4 text-gray-500">{p.event_date}</td>
                                <td className="py-4 font-bold text-[#251E3B]">{p.name}</td>
                                <td className="py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span></td>
                            </tr>
                        )) : <tr><td colSpan="3" className="py-8 text-center text-gray-400 italic">Belum ada riwayat proyek.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#251E3B]/5">
                <h3 className="font-bold text-[#251E3B] mb-4 flex items-center gap-2"><Icons.Calendar /> Ketersediaan</h3>
                <div className="flex items-center gap-3 mb-2 bg-green-50 p-4 rounded-xl border border-green-100">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shrink-0"></span>
                    <span className="font-bold text-green-800 text-sm">Available This Week</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mt-4">Vendor ini merespons rata-rata dalam <strong className="text-[#251E3B]">30 menit</strong>.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#251E3B]/5">
                <h3 className="font-bold text-[#251E3B] mb-4 flex items-center gap-2"><Icons.Document /> Kebijakan</h3>
                <ul className="text-sm space-y-4 text-gray-600">
                    <li className="flex justify-between border-b border-gray-50 pb-2"><span>Revisi</span> <span className="font-bold text-[#251E3B]">2x Minor Free</span></li>
                    <li className="flex justify-between border-b border-gray-50 pb-2"><span>Refund</span> <span className="font-bold text-[#251E3B]">50% (H-30)</span></li>
                    <li className="flex justify-between border-b border-gray-50 pb-2"><span>Overtime</span> <span className="font-bold text-[#251E3B]">500rb/jam</span></li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // B. TAMPILAN KHUSUS CLIENT
  // ==========================================
  const ClientView = () => (
    <div className="max-w-5xl mx-auto mt-8 mb-10 px-4 font-sans text-[#251E3B]">
        <div className="bg-white shadow-sm rounded-3xl p-10 border border-[#251E3B]/5 flex flex-col md:flex-row items-center gap-8 mb-8">
            <div className="relative shrink-0">
                {/* Style Avatar Client disamakan dengan Vendor/Navbar */}
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                     <img 
                        src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.style.display = 'none'} // Hide if error, show icon below
                     />
                </div>
                <div className="absolute bottom-2 right-2 bg-green-500 border-4 border-white w-8 h-8 rounded-full shadow-sm" title="Online"></div>
            </div>
            <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                    <h1 className="text-3xl font-extrabold text-[#251E3B]">{user.username}</h1>
                    <span className="bg-[#251E3B] text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide">Client</span>
                </div>
                <p className="text-gray-500 font-medium">Bergabung sejak Desember 2025 • Jakarta Selatan</p>
                
                <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                    <span className="text-xs flex items-center gap-1 text-green-700 font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-100"><Icons.Check /> Email Verified</span>
                    <span className="text-xs flex items-center gap-1 text-blue-700 font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"><Icons.Check /> Payment Connected</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#251E3B]/5">
                    <h3 className="font-bold text-[#251E3B] text-xl mb-6 border-b border-gray-100 pb-4 flex items-center gap-2"><Icons.Folder /> Riwayat Proyek</h3>
                    {projects.length > 0 ? (
                        <div className="space-y-4">
                            {projects.map(p => (
                                <div key={p.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                                    <div><p className="font-bold text-[#251E3B] text-lg">{p.name}</p><p className="text-xs text-gray-500 mt-1">{p.event_date}</p></div>
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-400 text-center py-8 italic">Belum ada riwayat proyek.</p>}
                </div>
            </div>
            
            <div className="space-y-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#251E3B]/5">
                    <h3 className="font-bold text-[#251E3B] mb-6 flex items-center gap-2"><Icons.Diamond /> Reputasi Client</h3>
                    <div className="space-y-6">
                        <div><div className="flex justify-between text-sm mb-2 font-bold text-gray-600"><span>Komunikasi</span><span className="text-[#FF9206]">5.0</span></div><div className="h-2 bg-gray-100 rounded-full"><div className="h-full bg-[#FF9206] rounded-full" style={{width: '100%'}}></div></div></div>
                        <div><div className="flex justify-between text-sm mb-2 font-bold text-gray-600"><span>Kejelasan Brief</span><span className="text-[#FF9206]">4.8</span></div><div className="h-2 bg-gray-100 rounded-full"><div className="h-full bg-[#FF9206] rounded-full" style={{width: '96%'}}></div></div></div>
                        <div><div className="flex justify-between text-sm mb-2 font-bold text-gray-600"><span>Pembayaran</span><span className="text-green-600">Excellent</span></div><div className="h-2 bg-gray-100 rounded-full"><div className="h-full bg-green-500 rounded-full" style={{width: '100%'}}></div></div></div>
                    </div>
                </div>
                
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#251E3B]/5">
                    <h3 className="font-bold text-[#251E3B] mb-4 flex items-center gap-2"><Icons.Target /> Preferensi</h3>
                    <div className="space-y-4 text-sm">
                        <div><p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Budget Range</p><p className="font-bold text-lg text-[#251E3B]">15 - 100 Juta</p></div>
                        <div><p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Top Categories</p><div className="flex flex-wrap gap-2 mt-2"><span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">Corporate</span><span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">Seminar</span></div></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#251E3B] font-bold animate-pulse">Memuat profil...</div>;
  return user.role === 'vendor' ? <VendorView /> : <ClientView />;
};

export default Profile;