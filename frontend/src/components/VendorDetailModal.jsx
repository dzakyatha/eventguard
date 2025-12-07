import React, { useState } from 'react'; // Tambah useState

const VendorDetailModal = ({ vendor, onClose, onOffer }) => {
  if (!vendor) return null;
  
  // State untuk error handling gambar di modal
  const [imgError, setImgError] = useState({ profile: false, header: false });

  // Path gambar lokal
  const localProfile = `/images/vendor_${vendor.id}_profile.jpg`;
  const localHeader = `/images/vendor_${vendor.id}_header.jpg`;
  const fallbackProfile = `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.vendor_name || vendor.username)}&background=random&color=fff&size=128`;
  
  const rating = vendor.rating ? `⭐ ${vendor.rating}` : '✨ New';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-fade-in-up">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-500 hover:text-gray-800 rounded-full p-2 transition-colors z-10 shadow-sm"
        >
          ✕
        </button>

        {/* Header Image Modal */}
        <div className="h-40 relative bg-gray-200">
           {!imgError.header ? (
                <img 
                    src={localHeader} 
                    alt="header"
                    className="w-full h-full object-cover"
                    onError={() => setImgError(prev => ({ ...prev, header: true }))}
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-purple-600"></div>
            )}

          {/* Profile Image Modal */}
          <div className="absolute -bottom-10 left-6">
            <img 
              src={!imgError.profile ? localProfile : fallbackProfile} 
              alt={vendor.vendor_name} 
              onError={() => setImgError(prev => ({ ...prev, profile: true }))}
              className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white object-cover"
            />
          </div>
        </div>

        <div className="pt-12 px-6 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {vendor.vendor_name || vendor.username}
              </h2>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mt-1">
                {vendor.category || 'Event Organizer'} • {vendor.location || 'Indonesia'}
              </p>
            </div>
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold text-sm h-fit">
              {rating}
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Tentang Vendor</h3>
            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
              {vendor.description || "Vendor ini belum memiliki deskripsi lengkap."}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="block text-xs text-gray-400 font-bold uppercase">Lokasi Layanan</span>
              <span className="text-sm font-semibold text-gray-800">{vendor.location || "Nasional"}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="block text-xs text-gray-400 font-bold uppercase">Status</span>
              <span className="text-sm font-semibold text-green-600">✅ Terverifikasi</span>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">
              Tutup
            </button>
            <button onClick={() => onOffer(vendor.id)} className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200 transition-all active:scale-95">
              📝 Ajukan Penawaran
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetailModal;