import { useState } from 'react';

// --- IKON SVG (HEROICONS) ---
const Icons = {
  Star: () => <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
  Sparkles: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Eye: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Verified: () => <svg className="w-5 h-5 text-blue-500 ml-1 inline-block" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>,
  MapPin: () => <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
};

const VendorCard = ({ vendor, onViewDetail }) => { 
  const [imgError, setImgError] = useState({ profile: false, header: false });

  // Debugging ID
  console.log(`Vendor: ${vendor.vendor_name}, ID: ${vendor.id}`);

  const localProfile = `/images/vendor_${vendor.id}_profile.jpg`;
  const localHeader = `/images/vendor_${vendor.id}_header.jpg`;
  
  const fallbackProfile = `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.vendor_name || vendor.username)}&background=random&color=fff&size=128`;
  
  // Rating Badge Logic
  const RatingBadge = () => (
    vendor.rating ? (
      <span className="bg-orange-50 text-orange-600 border border-orange-100 text-xs px-2 py-1 rounded-lg font-bold flex items-center gap-1 shadow-sm">
        <Icons.Star /> {vendor.rating}
      </span>
    ) : (
      <span className="bg-blue-50 text-blue-600 border border-blue-100 text-xs px-2 py-1 rounded-lg font-bold flex items-center gap-1 shadow-sm">
        <Icons.Sparkles /> New
      </span>
    )
  );

  return (
    <div 
        className="bg-white rounded-2xl shadow-sm border border-[#251E3B]/5 hover:shadow-lg hover:shadow-orange-500/5 hover:border-orange-200 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group relative" 
        onClick={() => onViewDetail(vendor)}
    >
      
      {/* === HEADER IMAGE === */}
      <div className="h-32 bg-slate-100 overflow-hidden relative">
        {!imgError.header ? (
            <img 
                src={localHeader} 
                alt="cover"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                    setImgError(prev => ({ ...prev, header: true }));
                }} 
            />
        ) : (
            // Fallback: Gradient Navy yang Elegan
            <div className="w-full h-full bg-gradient-to-r from-[#251E3B] to-[#1e1b4b]"></div>
        )}
        
        {/* Overlay Gradient agar teks profil lebih terbaca jika overlap */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* === PROFILE PICTURE === */}
      <div className="absolute top-20 left-5 z-10">
            <img 
                src={!imgError.profile ? localProfile : fallbackProfile} 
                alt={vendor.vendor_name} 
                onError={(e) => {
                    setImgError(prev => ({ ...prev, profile: true }));
                }}
                className="w-20 h-20 rounded-2xl border-4 border-white shadow-md object-cover bg-white"
            />
      </div>

      {/* === BODY === */}
      <div className="p-5 pt-12 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
            {/* Nama Vendor */}
            <h3 className="text-lg font-bold text-[#251E3B] line-clamp-1 group-hover:text-[#FF9206] transition-colors pr-2">
                {vendor.vendor_name || vendor.username}
                <Icons.Verified />
            </h3>
            
            {/* Rating */}
            <RatingBadge />
        </div>
        
        {/* Kategori & Lokasi */}
        <p className="text-slate-400 text-xs mb-3 font-semibold uppercase tracking-wide flex items-center">
            {vendor.category || 'Event Organizer'} 
            <span className="mx-2 text-slate-300">•</span> 
            <Icons.MapPin />
            {vendor.location || 'Indonesia'}
        </p>
        
        {/* Deskripsi */}
        <p className="text-slate-600 text-sm mb-5 line-clamp-2 flex-1 leading-relaxed">
            {vendor.description || 'Vendor profesional siap membantu acara Anda.'}
        </p>
        
        {/* Tombol Aksi */}
        <button 
            onClick={(e) => {
                e.stopPropagation(); 
                onViewDetail(vendor);
            }}
            className="w-full bg-white text-[#FF9206] border border-[#FF9206] font-bold py-2.5 px-4 rounded-xl hover:bg-orange-50 transition-all text-sm flex items-center justify-center gap-2 group-hover:shadow-md group-hover:shadow-orange-100"
        >
            <Icons.Eye /> Lihat Detail
        </button>
      </div>
    </div>
  );
};

export default VendorCard;