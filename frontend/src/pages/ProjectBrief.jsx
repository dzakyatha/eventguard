// src/pages/ProjectBrief.jsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const ProjectBrief = () => {
    const { vendorId } = useParams(); 
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',         // Backend project.py minta 'name', bukan 'title'
        location: '',     // Wajib
        event_date: '',
        budget_limit: '', // Harus di-convert ke int
        description: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Sesuai schema ProjectCreate di project.py
            const payload = {
                name: formData.name,
                location: formData.location,
                event_date: formData.event_date,
                budget_limit: parseInt(formData.budget_limit),
                description: formData.description
            };

            await client.post(ENDPOINTS.PROJECTS.CREATE, payload);
            
            alert("Brief berhasil dibuat!");
            navigate('/dashboard');
        } catch (error) {
            console.error("Gagal membuat proyek:", error);
            alert("Gagal kirim brief. Pastikan semua field terisi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-6">
            <button 
                onClick={() => navigate(-1)} // Mundur 1 halaman (ke Search)
                className="mb-4 text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1 font-medium"
            >
                ← Batal & Kembali
            </button>

            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">📝 Buat Proyek Baru</h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Acara</label>
                        <input name="name" type="text" required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" onChange={handleChange} placeholder="Contoh: Gathering Kantor Tahunan" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                            <input name="location" type="text" required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" onChange={handleChange} placeholder="Bandung" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Acara</label>
                            <input name="event_date" type="date" required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget Limit (Rp)</label>
                        <input name="budget_limit" type="number" required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" onChange={handleChange} placeholder="15000000" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Kebutuhan</label>
                        <textarea name="description" rows="4" required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" onChange={handleChange} placeholder="Jelaskan detail acara Anda..."></textarea>
                    </div>

                    <div className="pt-4">
                        <button type="submit" disabled={loading} className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors shadow-md">
                            {loading ? 'Memproses...' : 'Kirim Brief Proyek'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectBrief;