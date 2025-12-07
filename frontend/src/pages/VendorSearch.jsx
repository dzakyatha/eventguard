import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import VendorCard from '../components/VendorCard';
import VendorDetailModal from '../components/VendorDetailModal'; 

// Ikon Filter
const Icons = {
    Search: () => <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Filter: () => <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
};

const VendorSearch = () => {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const response = await client.get(ENDPOINTS.VENDORS.LIST);
                setVendors(response.data);
            } catch (error) {
                console.error("Gagal ambil data vendor:", error);
                // Data Mockup jika backend mati/kosong
                setVendors([
                    { id: 1, vendor_name: "Catering Lezat Bandung", category: "Catering", location: "Bandung", description: "Spesialis prasmanan tradisional.", rating: "4.8" },
                    { id: 2, vendor_name: "Lensa Abadi", category: "Dokumentasi", location: "Jakarta", description: "Fotografi dan videografi cinematic.", rating: "4.9" },
                    { id: 3, vendor_name: "Sound System Oke", category: "Sound System", location: "Bandung", description: "Sewakan sound system 5000 watt.", rating: "4.5" },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchVendors();
    }, []);

    const categories = ['All', 'Catering', 'Dokumentasi', 'Sound System', 'Venue', 'Decoration'];

    const filteredVendors = vendors.filter(v => {
        const nameMatch = (v.vendor_name || v.username || "").toLowerCase().includes(filter.toLowerCase());
        const catMatch = activeCategory === 'All' || (v.category || "").toLowerCase() === activeCategory.toLowerCase();
        return nameMatch && catMatch;
    });

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#251E3B] p-8">
            
            {/* HEADER & SEARCH BAR (Style ala Booking Tiket) */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#251E3B]/10 p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#251E3B]">Cari Vendor Event</h1>
                        <p className="text-sm text-gray-500 mt-1">Temukan partner terbaik untuk acara Anda.</p>
                    </div>
                    
                    {/* Search Input Modern */}
                    <div className="relative w-full md:w-1/2">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Icons.Search />
                        </div>
                        <input 
                            type="text"
                            placeholder="Cari nama vendor..."
                            className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9206]/20 focus:border-[#FF9206] transition-all"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                </div>

                {/* CATEGORY TABS (Horizontal Scroll) */}
                <div className="flex gap-3 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                        <Icons.Filter /> Filter
                    </button>
                    <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                                activeCategory === cat 
                                ? 'bg-[#251E3B] text-white shadow-lg shadow-slate-500/20' 
                                : 'bg-white border border-gray-200 text-gray-500 hover:border-[#FF9206] hover:text-[#FF9206]'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* VENDOR GRID */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3].map(i => <div key={i} className="h-80 bg-white rounded-3xl animate-pulse"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVendors.map(vendor => (
                        <VendorCard 
                            key={vendor.id} 
                            vendor={vendor} 
                            onViewDetail={(v) => setSelectedVendor(v)} 
                        />
                    ))}
                </div>
            )}
            
            {filteredVendors.length === 0 && !loading && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                    <p className="text-gray-400 font-medium">Tidak ada vendor yang cocok dengan pencarian Anda.</p>
                    <button onClick={() => {setFilter(''); setActiveCategory('All');}} className="mt-4 text-[#FF9206] font-bold hover:underline">Reset Filter</button>
                </div>
            )}

            {/* MODAL DETAIL */}
            {selectedVendor && (
                <VendorDetailModal 
                    vendor={selectedVendor} 
                    onClose={() => setSelectedVendor(null)} 
                    onOffer={(id) => navigate(`/create-brief/${id}`)}
                />
            )}
        </div>
    );
};

export default VendorSearch;