import { useState } from 'react';

const VendorCard = ({ vendor, onViewDetail }) => { 
  const [imgError, setImgError] = useState({ profile: false, header: false });
  const localProfile = `/images/vendor_${vendor.id}_profile.jpg`;
  const localHeader = `/images/vendor_${vendor.id}_header.jpg`;
  const fallbackProfile = `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.vendor_name || vendor.username)}&background=random&color=fff&size=128`;
  const rating = vendor.rating ? `⭐ ${vendor.rating}` : '✨ New';
  const VerifiedIcon = () => (
    <svg className="w-5 h-5 text-blue-500 ml-1 inline-block align-text-bottom" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );

  return (
    <div 
        className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden flex flex-col cursor-pointer group relative" 
        onClick={() => onViewDetail(vendor)}
    >
      
      {/* === HEADER IMAGE (Container Sendiri) === */}
      <div className="h-28 bg-gray-200 overflow-hidden relative">
        {!imgError.header ? (
            <img 
                src={localHeader} 
                alt="cover"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                    console.warn("Gagal load header:", localHeader); // Cek log jika gagal
                    setImgError(prev => ({ ...prev, header: true }));
                }} 
            />
        ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
        )}
      </div>

      {/* === PROFILE PICTURE (DIPINDAH KELUAR HEADER) === */}
      {/* Posisi absolute relatif terhadap Card utama, bukan Header */}
      <div className="absolute top-20 left-4 z-10">
            <img 
                src={!imgError.profile ? localProfile : fallbackProfile} 
                alt={vendor.vendor_name} 
                onError={(e) => {
                    console.warn("Gagal load profile:", localProfile); // Cek log jika gagal
                    setImgError(prev => ({ ...prev, profile: true }));
                }}
                className="w-16 h-16 rounded-full border-4 border-white shadow-md object-cover bg-white"
            />
      </div>

      {/* === BODY === */}
      <div className="p-4 pt-10 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                {vendor.vendor_name || vendor.username}
                <VerifiedIcon />
            </h3>
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                {rating}
            </span>
        </div>
        
        <p className="text-gray-500 text-xs mb-3 font-medium uppercase tracking-wide">
            {vendor.category || 'Event Organizer'} • {vendor.location || 'Indonesia'}
        </p>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
            {vendor.description || 'Vendor profesional siap membantu acara Anda.'}
        </p>
        
        <button 
            onClick={(e) => {
                e.stopPropagation(); 
                onViewDetail(vendor);
            }}
            className="w-full bg-white text-indigo-600 border border-indigo-600 font-bold py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors text-sm"
        >
            👁️ Lihat Detail
        </button>
      </div>
    </div>
  );
};

export default VendorCard;