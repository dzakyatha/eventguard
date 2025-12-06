// src/pages/VendorSearch.jsx
import { useEffect, useState } from 'react';
import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import VendorCard from '../components/VendorCard';

const VendorSearch = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchVendors = async () => {
        try {
            const response = await client.get(ENDPOINTS.VENDORS.LIST);
            setVendors(response.data);
        } catch (error) {
            console.error("Gagal ambil data vendor:", error);
            
            setVendors([
            { id: 1, name: "Catering Lezat Bandung", category: "Catering", location: "Bandung", description: "Spesialis prasmanan tradisional.", is_verified: true },
            { id: 2, name: "Lensa Abadi", category: "Dokumentasi", location: "Jakarta", description: "Fotografi dan videografi cinematic.", is_verified: true },
            { id: 3, name: "Sound System Oke", category: "Equipment", location: "Bandung", description: "Sewakan sound system 5000 watt.", is_verified: false },
            ]);
        } finally {
            setLoading(false);
        }
        };

        fetchVendors();
    }, []);

    const filteredVendors = vendors.filter(v => {

        const nameToCheck = (v.vendor_name || v.username || "").toLowerCase();
        
        const categoryToCheck = (v.category || "").toLowerCase();
        
        const filterText = filter.toLowerCase();

        return nameToCheck.includes(filterText) || categoryToCheck.includes(filterText);
    });

    return (
        <div>
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Cari Vendor Event</h1>
            <p className="text-gray-600">Temukan vendor terverifikasi untuk keamanan transaksi Anda.</p>
        </div>

        <div className="mb-6">
            <input 
            type="text"
            placeholder="Cari nama vendor atau kategori (misal: Catering)..."
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            />
        </div>

        {loading ? (
            <p>Memuat data vendor...</p>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map(vendor => (
                <VendorCard key={vendor.id} vendor={vendor} />
            ))}
            </div>
        )}
        
        {filteredVendors.length === 0 && !loading && (
            <p className="text-center text-gray-500 mt-10">Tidak ada vendor yang ditemukan.</p>
        )}
        </div>
    );
};

export default VendorSearch;