// src/components/VendorCard.jsx
import { useNavigate } from 'react-router-dom';

const VendorCard = ({ vendor }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900">{vendor.vendor_name || vendor.username}</h3>
            {vendor.is_verified && (
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-green-400">
                ✓ Terverifikasi
            </span>
            )}
        </div>
        <p className="text-gray-500 text-sm mb-3">{vendor.category} • {vendor.location}</p>
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{vendor.description}</p>
        
        <button 
            onClick={() => navigate(`/create-brief/${vendor.id}`)}
            className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-medium py-2 px-4 rounded transition-colors"
        >
            Ajukan Penawaran
        </button>
        </div>
    );
};

export default VendorCard;