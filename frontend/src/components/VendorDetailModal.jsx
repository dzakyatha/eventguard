import React, { useState } from 'react';

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

  // PERBAIKAN PORTOFOLIO: Menggunakan URL Picsum yang lebih stabil
  const mockPortfolio = [
    { id: 1, title: "Festival Musik Kampus", date: "Des 2024", img: "https://picsum.photos/id/453/400/300" }, 
    { id: 2, title: "Wedding Rina & Budi", date: "Nov 2024", img: "https://picsum.photos/id/338/400/300" }, 
    { id: 3, title: "Corporate Gathering", date: "Okt 2024", img: "https://picsum.photos/id/180/400/300" }, 
  ];

  const mockReviews = [
    { name: "Siti Aminah", rating: 5, text: "Sangat profesional! Crew datang tepat waktu dan ramah.", date: "2 hari lalu" },
    { name: "PT Teknologi Maju", rating: 4, text: "Hasil bagus, tapi respon chat agak lambat di awal.", date: "1 minggu lalu" },
  ];

  // Icons
  const VerifiedIcon = () => <svg className="w-5 h-5 text-blue-500 inline-block ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>;
  const LocationIcon = () => <svg className="w-4 h-4 text-gray-400 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden relative animate-fade-in-up my-8 flex flex-col max-h-[90vh]">
        
        <button onClick={onClose} className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-500 hover:text-gray-800 rounded-full p-2 transition-colors z-20 shadow-sm">✕</button>

        {/* --- HEADER --- */}
        <div className="shrink-0">
            {/* Cover Image */}
            <div className="h-40 relative bg-gray-200">
                {!imgError.header ? (
                    <img src={localHeader} className="w-full h-full object-cover" onError={() => setImgError(prev => ({ ...prev, header: true }))} />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                )}
                
                <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> Available Today
                </div>
            </div>

            {/* Profile & Info Section (REVISI CSS TOTAL) */}
            <div className="px-8 pb-4 relative flex items-start"> {/* items-start agar tidak dipaksa ke bawah */}
                
                {/* Foto Profil */}
                <div className="-mt-12 shrink-0 z-10"> {/* Negative margin untuk menarik ke atas */}
                    <img 
                        src={!imgError.profile ? localProfile : fallbackProfile} 
                        onError={() => setImgError(prev => ({ ...prev, profile: true }))}
                        className="w-32 h-32 rounded-xl border-4 border-white shadow-lg bg-white object-cover" 
                    />
                </div>

                {/* Info Teks (Kanan) */}
                <div className="flex-1 ml-5 mt-3"> {/* mt-3 mendorong teks ke bawah agar pas dengan sisi kanan foto */}
                    <div className="flex justify-between items-start">
                        
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 flex items-center mb-1">
                                {vendor.vendor_name || vendor.username}
                                <VerifiedIcon />
                            </h2>
                            <p className="text-gray-500 font-medium mb-2">{vendor.category || 'Event Specialist'}</p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span><LocationIcon />{vendor.location || 'Indonesia'}</span>
                                <span className="flex items-center text-yellow-600 font-bold">⭐ {rating} <span className="text-gray-400 font-normal ml-1">(128 reviews)</span></span>
                            </div>
                        </div>

                        {/* Legalitas Badges */}
                        <div className="hidden md:block text-right">
                            <div className="text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded inline-block mr-2">✔ Identitas Terverifikasi</div>
                            <div className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 rounded inline-block">✔ NIB Legal</div>
                        </div>

                    </div>
                </div>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-8 flex gap-6 text-sm font-bold text-gray-500 sticky top-0 bg-white z-10">
            {['overview', 'packages', 'portfolio', 'reviews'].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent hover:text-gray-800'}`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="p-8 overflow-y-auto bg-gray-50 flex-1">
            {/* TAB OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-3 text-lg">Tentang Vendor</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {vendor.description || "Vendor berpengalaman yang siap mensukseskan acara Anda dengan peralatan profesional dan tim yang solid."}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-3">🛠️ Spesifikasi & Alat</h3>
                            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                                <li>Experience: 8+ Years</li>
                                <li>Crew Capacity: 25 Orang</li>
                                <li>Equipment: JBL Vertec Series, Sony A7S III</li>
                                <li>Max Capacity: 5000 Audience</li>
                            </ul>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-3">📜 Terms & Policy</h3>
                            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                                <li><strong>Escrow:</strong> 100% via EventGuard</li>
                                <li><strong>Revisi:</strong> Max 3x Minor Revision</li>
                                <li><strong>Luar Kota:</strong> Transport + Akomodasi ditanggung Client</li>
                                <li><strong>Overtime:</strong> Rp 500rb / jam</li>
                            </ul>
                        </div>
                    </div>
                    <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                        <h3 className="font-bold text-indigo-900 mb-2">FAQ</h3>
                        <div className="space-y-3">
                            <details className="group">
                                <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-sm text-indigo-800">
                                    <span>Apakah harga sudah termasuk crew?</span>
                                    <span className="transition group-open:rotate-180">▼</span>
                                </summary>
                                <p className="text-indigo-600 text-xs mt-2 group-open:animate-fadeIn">Ya, harga paket sudah termasuk crew setup dan operator.</p>
                            </details>
                            <details className="group">
                                <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-sm text-indigo-800">
                                    <span>Seberapa cepat bisa mulai?</span>
                                    <span className="transition group-open:rotate-180">▼</span>
                                </summary>
                                <p className="text-indigo-600 text-xs mt-2 group-open:animate-fadeIn">Kami butuh minimal 3 hari persiapan sebelum hari H.</p>
                            </details>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB PACKAGES */}
            {activeTab === 'packages' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mockPackages.map((pkg, idx) => (
                        <div key={idx} className={`bg-white p-5 rounded-xl border flex flex-col ${idx === 1 ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md relative' : 'border-gray-200'}`}>
                            {idx === 1 && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">Most Popular</span>}
                            <h4 className="font-bold text-gray-800 text-lg">{pkg.name}</h4>
                            <div className="text-2xl font-bold text-indigo-600 my-2">{pkg.price}</div>
                            <p className="text-xs text-gray-500 font-bold uppercase mb-4">Estimasi: {pkg.time}</p>
                            <p className="text-sm text-gray-600 flex-1">{pkg.desc}</p>
                            <button onClick={() => onOffer(vendor.id)} className="mt-4 w-full py-2 rounded-lg border border-indigo-600 text-indigo-600 font-bold text-sm hover:bg-indigo-50">Pilih Paket</button>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB PORTFOLIO */}
            {activeTab === 'portfolio' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {mockPortfolio.map((item) => (
                        <div key={item.id} className="group relative rounded-xl overflow-hidden aspect-video bg-gray-200 cursor-pointer">
                            <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
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
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100">
                        <div className="text-4xl font-bold text-gray-800">4.9</div>
                        <div>
                            <div className="text-yellow-400 text-sm">⭐⭐⭐⭐⭐</div>
                            <p className="text-xs text-gray-500">Based on 128 reviews</p>
                        </div>
                    </div>
                    {mockReviews.map((rev, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-start">
                                <h5 className="font-bold text-sm text-gray-800">{rev.name}</h5>
                                <span className="text-xs text-gray-400">{rev.date}</span>
                            </div>
                            <div className="text-yellow-400 text-xs my-1">{"⭐".repeat(rev.rating)}</div>
                            <p className="text-sm text-gray-600">{rev.text}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Footer Tombol Aksi */}
        <div className="p-4 bg-white border-t border-gray-200 flex gap-3 shrink-0">
            <button onClick={onClose} className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 w-1/3">
                Tutup
            </button>
            <button onClick={() => onOffer(vendor.id)} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200 w-2/3 flex justify-center items-center gap-2 transition-transform active:scale-95">
                📝 Request Quote / Book
            </button>
        </div>

      </div>
    </div>
  );
};

export default VendorDetailModal;