import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const ProjectBrief = () => {
    const { vendorId } = useParams(); 
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // State Data Form (Sesuai Request Anda)
    const [formData, setFormData] = useState({
        name: '',
        category: 'Corporate Event',
        services: [], 
        
        // Waktu & Lokasi Detail
        location: '',
        event_date: '',
        start_time: '',
        end_time: '',
        
        // Anggaran & Spek
        budget_limit: '',
        audience_count: '', // Jumlah peserta
        
        // Timeline
        deadline_proposal: '', // Deadline penawaran
        
        // Deskripsi & Link
        description: '',
        doc_link: '',
        special_requirements: '' // Persyaratan khusus
    });

    const serviceOptions = [
        "Venue Management", "Catering & F&B", "Decoration", 
        "Sound System & Lighting", "Talent / MC / Band", 
        "Dokumentasi (Foto/Video)", "Manajemen Tiket / RSVP", "Keamanan / Security"
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleServiceChange = (service) => {
        setFormData(prev => {
            const newServices = prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service];
            return { ...prev, services: newServices };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // --- RAHASIA AGAR BACKEND TIDAK KOMPLEKS ---
            // Kita gabungkan semua data form menjadi satu "Laporan Rapi" dalam format teks.
            // Backend hanya menyimpan ini di kolom 'description'.
            
            const detailedDescription = `
=== DETAIL PROJECT BRIEF ===

[1. INFORMASI DASAR]
• Kategori: ${formData.category}
• Estimasi Peserta: ${formData.audience_count || '-'} orang

[2. KEBUTUHAN LAYANAN]
${formData.services.length > 0 ? formData.services.map(s => `✓ ${s}`).join('\n') : '-'}

[3. WAKTU PELAKSANAAN]
• Jam Mulai: ${formData.start_time || '-'}
• Jam Selesai: ${formData.end_time || '-'}
• Deadline Kirim Proposal: ${formData.deadline_proposal || '-'}

[4. DESKRIPSI & TUJUAN]
${formData.description}

[5. PERSYARATAN KHUSUS & TEKNIS]
${formData.special_requirements || '-'}

[6. LAMPIRAN DOKUMEN]
Link: ${formData.doc_link || '(Tidak ada lampiran)'}
            `.trim();

            const payload = {
                name: formData.name,
                location: formData.location,
                event_date: formData.event_date,
                budget_limit: parseInt(formData.budget_limit),
                description: detailedDescription // <-- Semua info masuk ke sini!
            };

            await client.post(ENDPOINTS.PROJECTS.CREATE, payload);
            
            alert("Brief Proyek berhasil dikirim!");
            navigate('/dashboard');
        } catch (error) {
            console.error("Gagal membuat proyek:", error);
            alert("Gagal kirim brief. Cek koneksi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-6 mb-10">
            <button onClick={() => navigate(-1)} className="mb-4 text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1 font-medium">← Batal & Kembali</button>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="border-b pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">📝 Brief Proyek</h2>
                    <p className="text-sm text-gray-500 mt-1">Isi detail selengkap mungkin agar Vendor paham ekspektasi Anda.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* BAGIAN 1: INFO DASAR */}
                    <section className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wide mb-4">1. Informasi Utama</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="label-style">Nama Proyek / Judul Event</label>
                                <input name="name" type="text" required className="input-style" onChange={handleChange} placeholder="Contoh: Launching Produk A" />
                            </div>
                            <div>
                                <label className="label-style">Kategori Event</label>
                                <select name="category" className="input-style bg-white" onChange={handleChange}>
                                    <option>Corporate Event (Gathering/Launch)</option>
                                    <option>Wedding / Engagement</option>
                                    <option>Concert / Music Festival</option>
                                    <option>Seminar / Conference</option>
                                    <option>Exhibition / Pameran</option>
                                    <option>Private Party / Birthday</option>
                                </select>
                            </div>
                            <div>
                                <label className="label-style">Estimasi Jumlah Peserta</label>
                                <input name="audience_count" type="number" className="input-style" onChange={handleChange} placeholder="Contoh: 150" />
                            </div>
                        </div>
                    </section>

                    {/* BAGIAN 2: DETAIL TEKNIS */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">2. Detail Kebutuhan Teknis</h3>
                        
                        <div className="mb-4">
                            <label className="label-style mb-2 block">Checklist Layanan yang Diperlukan</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {serviceOptions.map((service) => (
                                    <label key={service} className="flex items-center space-x-2 cursor-pointer bg-white p-2 border rounded hover:bg-indigo-50 transition">
                                        <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" onChange={() => handleServiceChange(service)} />
                                        <span className="text-xs font-medium text-gray-700">{service}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="label-style">Deskripsi Singkat & Tujuan Acara</label>
                            <textarea name="description" rows="3" required className="input-style" onChange={handleChange} placeholder="Jelaskan tujuan acara secara umum..."></textarea>
                        </div>

                        <div className="mb-4">
                            <label className="label-style">Persyaratan Khusus (Opsional)</label>
                            <textarea name="special_requirements" rows="2" className="input-style" onChange={handleChange} placeholder="Contoh: Harus bersertifikat Halal, Sound system min 5000 watt, Talent wanita, dll."></textarea>
                        </div>
                    </section>

                    {/* BAGIAN 3: WAKTU & LOKASI */}
                    <section className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wide mb-4">3. Logistik & Waktu</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="md:col-span-3">
                                <label className="label-style">Lokasi / Venue</label>
                                <input name="location" type="text" required className="input-style" onChange={handleChange} placeholder="Nama Gedung / Hotel / Area" />
                            </div>
                            <div>
                                <label className="label-style">Tanggal Acara</label>
                                <input name="event_date" type="date" required className="input-style" onChange={handleChange} />
                            </div>
                            <div>
                                <label className="label-style">Jam Mulai</label>
                                <input name="start_time" type="time" className="input-style" onChange={handleChange} />
                            </div>
                            <div>
                                <label className="label-style">Jam Selesai</label>
                                <input name="end_time" type="time" className="input-style" onChange={handleChange} />
                            </div>
                        </div>
                    </section>

                    {/* BAGIAN 4: ANGGARAN & DOKUMEN */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">4. Anggaran & Dokumen</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="label-style">Pagu Anggaran / Budget (Rp)</label>
                                <input name="budget_limit" type="number" required className="input-style" onChange={handleChange} placeholder="15000000" />
                            </div>
                            <div>
                                <label className="label-style">Deadline Terima Proposal</label>
                                <input name="deadline_proposal" type="date" className="input-style" onChange={handleChange} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="label-style">Link Dokumen Pendukung (GDrive/Dropbox)</label>
                                <input name="doc_link" type="text" className="input-style" onChange={handleChange} placeholder="https://..." />
                                <p className="text-xs text-gray-400 mt-1">Lampirkan rundown, moodboard, atau layout venue jika ada.</p>
                            </div>
                        </div>
                    </section>

                    <div className="pt-6 border-t">
                        <button type="submit" disabled={loading} className="w-full px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:bg-indigo-300 transition-all shadow-lg active:scale-95 flex justify-center items-center gap-2">
                            {loading ? 'Mengirim Data...' : '🚀 Kirim Brief Proyek'}
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Style CSS in JS untuk clean code */}
            <style>{`
                .label-style { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem; }
                .input-style { width: 100%; padding: 0.625rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; outline: none; transition: all; }
                .input-style:focus { ring: 2px; --tw-ring-color: #6366f1; border-color: #6366f1; }
            `}</style>
        </div>
    );
};

export default ProjectBrief;