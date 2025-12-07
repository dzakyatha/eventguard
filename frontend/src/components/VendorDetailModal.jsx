import React, { useState } from 'react';

// --- IKON SVG HEROICONS ---
const Icons = {
  Verified: () => <svg className="w-5 h-5 text-blue-500 ml-1 inline-block" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>,
  Location: () => <svg className="w-4 h-4 text-gray-400 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Star: () => <svg className="w-4 h-4 text-[#FF9206] inline-block mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  Briefcase: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Tool: () => <svg className="w-5 h-5 text-[#251E3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Document: () => <svg className="w-5 h-5 text-[#251E3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
};

const VendorDetailModal = ({ vendor, onClose, onOffer }) => {
  if (!vendor) return null;
  
  const [activeTab, setActiveTab] = useState('overview');
  const [imgError, setImgError] = useState({ profile: false, header: false });

  const localProfile = `/images/vendor_${vendor.id}_profile.jpg`;
  const localHeader = `/images/vendor_${vendor.id}_header.jpg`;
  const fallbackProfile = `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.vendor_name || vendor.username)}&background=random&color=fff&size=128`;
  const rating = vendor.rating || '4.9'; 

  // --- MOCK DATA ---
  const mockPackages = [
    { name: "Basic", price: "Rp 5.000.000", desc: "Venue support + Dokumentasi 3 Jam", time: "1-3 Hari" },
    { name: "Standard", price: "Rp 12.000.000", desc: "Basic + Lighting + MC + Runner Crew", time: "2-7 Hari" },
    { name: "Premium", price: "Rp 25.000.000+", desc: "Full Service, Drone, 3 Camera, 5000 Watt Sound", time: "Flexible" },
  ];

  const mockPortfolio = [
    { id: 1, title: "Festival Musik Kampus", date: "Des 2024", img: "https://picsum.photos/id/453/400/300" }, 
    { id: 2, title: "Wedding Rina & Budi", date: "Nov 2024", img: "https://picsum.photos/id/338/400/300" }, 
    { id: 3, title: "Corporate Gathering", date: "Okt 2024", img: "https://picsum.photos/id/180/400/300" }, 
  ];

  const mockReviews = [
    { name: "Siti Aminah", rating: 5, text: "Sangat profesional! Crew datang tepat waktu dan ramah.", date: "2 hari lalu" },
    { name: "PT Teknologi Maju", rating: 4, text: "Hasil bagus, tapi respon chat agak lambat di awal.", date: "1 minggu lalu" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#251E3B]/60 backdrop-blur-sm overflow-y-auto font-sans">
      {/* ANIMASI POPUP:
          Menambahkan class 'animate-popup' di sini. 
          Definisi animasinya ada di tag <style> paling bawah.
      */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden relative animate-popup my-8 flex flex-col max-h-[90vh]">
        
        {/* Tombol Close */}
        <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 hover:bg-white text-white hover:text-gray-800 rounded-full p-2 transition-colors z-20 backdrop-blur-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* --- HEADER --- */}
        <div className="shrink-0">
            {/* Cover Image */}
            <div className="h-48 relative bg-gray-200">
                {!imgError.header ? (
                    <img src={localHeader} className="w-full h-full object-cover" onError={() => setImgError(prev => ({ ...prev, header: true }))} />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#251E3B] to-[#1e1b4b]"></div>
                )}
                
                {/* Badge Status */}
                <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> Available Today
                </div>
            </div>

            {/* Profile & Info Section */}
            <div className="px-8 pb-4 relative flex items-end -mt-16"> 
                {/* Foto Profil */}
                <div className="shrink-0 mr-6 relative z-10">
                    <img 
                        src={!imgError.profile ? localProfile : fallbackProfile} 
                        onError={() => setImgError(prev => ({ ...prev, profile: true }))}
                        className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl object-cover bg-white" 
                    />
                </div>

                {/* Info Teks */}
                <div className="flex-1 pb-1 pt-16">
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-extrabold text-[#251E3B] flex items-center mb-1">
                                {vendor.vendor_name || vendor.username}
                                <Icons.Verified />
                            </h2>
                            <p className="text-gray-500 font-medium mb-2 text-sm">{vendor.category || 'Event Specialist'}</p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center"><Icons.Location /> {vendor.location || 'Indonesia'}</span>
                                <span className="flex items-center font-bold text-[#251E3B]"><Icons.Star /> {rating} <span className="font-normal ml-1 text-gray-400">(128 reviews)</span></span>
                            </div>
                        </div>
                        {/* Legalitas Badges */}
                        <div className="hidden md:flex flex-col items-end gap-1">
                            <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded">✔ Identitas</span>
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded">✔ NIB Legal</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-100 px-8 flex gap-8 text-sm font-bold text-gray-400 sticky top-0 bg-white z-10 pt-2">
            {['overview', 'packages', 'portfolio', 'reviews'].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 border-b-2 transition-all capitalize ${activeTab === tab ? 'border-[#FF9206] text-[#FF9206]' : 'border-transparent hover:text-[#251E3B]'}`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="p-8 overflow-y-auto bg-[#F8FAFC] flex-1 text-[#251E3B]">
            {/* TAB OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-[#251E3B] mb-3 text-lg">Tentang Vendor</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">
                            {vendor.description || "Vendor berpengalaman yang siap mensukseskan acara Anda dengan peralatan profesional dan tim yang solid."}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-[#251E3B] mb-4 text-sm uppercase tracking-wide flex items-center gap-2"><Icons.Tool /> Spesifikasi & Alat</h3>
                            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                                <li>Experience: 8+ Years</li>
                                <li>Crew Capacity: 25 Orang</li>
                                <li>Equipment: JBL Vertec Series, Sony A7S III</li>
                                <li>Max Capacity: 5000 Audience</li>
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-[#251E3B] mb-4 text-sm uppercase tracking-wide flex items-center gap-2"><Icons.Document /> Terms & Policy</h3>
                            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                                <li><strong>Escrow:</strong> 100% via EventGuard</li>
                                <li><strong>Revisi:</strong> Max 3x Minor Revision</li>
                                <li><strong>Luar Kota:</strong> Transport + Akomodasi ditanggung Client</li>
                                <li><strong>Overtime:</strong> Rp 500rb / jam</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB PACKAGES */}
            {activeTab === 'packages' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mockPackages.map((pkg, idx) => (
                        <div key={idx} className={`bg-white p-6 rounded-2xl border flex flex-col transition-all ${idx === 1 ? 'border-[#FF9206] shadow-lg shadow-orange-100 scale-105 z-10' : 'border-gray-100 hover:shadow-md'}`}>
                            {idx === 1 && <span className="bg-[#FF9206] text-white text-[10px] px-3 py-1 rounded-full uppercase font-bold tracking-wide w-fit mb-2">Popular</span>}
                            <h4 className="font-bold text-[#251E3B] text-lg">{pkg.name}</h4>
                            <div className="text-2xl font-extrabold text-[#251E3B] my-2">{pkg.price}</div>
                            <p className="text-xs text-gray-400 font-bold uppercase mb-4">Estimasi: {pkg.time}</p>
                            <p className="text-sm text-gray-600 flex-1 border-t border-gray-100 pt-4 mt-2">{pkg.desc}</p>
                            <button onClick={() => onOffer(vendor.id)} className="mt-6 w-full py-3 rounded-xl border border-[#FF9206] text-[#FF9206] font-bold text-sm hover:bg-[#FF9206] hover:text-white transition-all">Pilih Paket</button>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB PORTFOLIO */}
            {activeTab === 'portfolio' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {mockPortfolio.map((item) => (
                        <div key={item.id} className="group relative rounded-2xl overflow-hidden aspect-video bg-gray-200 cursor-pointer shadow-sm hover:shadow-lg transition-all">
                            <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#251E3B]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                <p className="text-white font-bold text-sm">{item.title}</p>
                                <p className="text-gray-300 text-xs">{item.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB REVIEWS */}
            {activeTab === 'reviews' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-5xl font-extrabold text-[#251E3B]">4.9</div>
                        <div>
                            <div className="flex text-[#FF9206] text-sm mb-1">
                                {[1,2,3,4,5].map(i => <Icons.Star key={i} />)}
                            </div>
                            <p className="text-xs text-gray-500 font-medium">Based on 128 verified reviews</p>
                        </div>
                    </div>
                    {mockReviews.map((rev, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <h5 className="font-bold text-sm text-[#251E3B]">{rev.name}</h5>
                                <span className="text-xs text-gray-400">{rev.date}</span>
                            </div>
                            <div className="flex text-[#FF9206] text-xs mb-2">
                                {[...Array(rev.rating)].map((_, i) => <Icons.Star key={i} />)}
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">"{rev.text}"</p>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Footer Tombol Aksi */}
        <div className="p-5 bg-white border-t border-gray-100 flex gap-4 shrink-0">
            <button onClick={onClose} className="px-6 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 w-1/3 transition-colors">
                Tutup
            </button>
            <button onClick={() => onOffer(vendor.id)} className="px-6 py-3 bg-[#FF9206] text-white font-bold rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-200 w-2/3 flex justify-center items-center gap-2 transition-transform active:scale-95">
                <Icons.Briefcase /> Request Quote / Book
            </button>
        </div>

      </div>

      {/* --- CSS ANIMASI --- */}
      <style>{`
        @keyframes popup {
          0% { opacity: 0; transform: scale(0.95) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-popup {
          animation: popup 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default VendorDetailModal;