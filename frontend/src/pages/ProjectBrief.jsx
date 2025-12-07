import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

// --- IKON SVG ---
const Icons = {
  Back: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Edit: () => <svg className="w-6 h-6 text-[#FF9206]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Info: () => <svg className="w-5 h-5 text-[#251E3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Tool: () => <svg className="w-5 h-5 text-[#251E3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Map: () => <svg className="w-5 h-5 text-[#251E3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Money: () => <svg className="w-5 h-5 text-[#251E3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Send: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
};

const ProjectBrief = () => {
    const { vendorId } = useParams(); 
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [targetVendor, setTargetVendor] = useState(null);

    useEffect(() => {
        const fetchVendor = async () => {
            if (!vendorId) return;
            try {
                const res = await client.get(ENDPOINTS.VENDORS.DETAIL(vendorId));
                setTargetVendor(res.data);
            } catch (error) {
                console.error("Gagal ambil data vendor:", error);
                alert("Vendor tidak ditemukan.");
                navigate('/search');
            }
        };
        fetchVendor();
    }, [vendorId, navigate]);
    
    // State Data Form
    const [formData, setFormData] = useState({
        name: '',
        category: 'Corporate Event',
        services: [], 
        
        // Waktu & Lokasi
        location: '',
        event_date: '',
        start_time: '',
        end_time: '',
        
        // Anggaran & Spek
        budget_limit: '',
        audience_count: '',
        
        // Timeline
        deadline_proposal: '', 
        
        // Deskripsi
        description: '',
        doc_link: '',
        special_requirements: ''
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
            const detailedDescription = `
DETAIL PROJECT BRIEF

1. INFORMASI DASAR
• Kategori: ${formData.category}
• Estimasi Peserta: ${formData.audience_count || '-'} orang

2. KEBUTUHAN LAYANAN
${formData.services.length > 0 ? formData.services.map(s => `✓ ${s}`).join('\n') : '-'}

3. WAKTU PELAKSANAAN
• Jam Mulai: ${formData.start_time || '-'}
• Jam Selesai: ${formData.end_time || '-'}
• Deadline Kirim Proposal: ${formData.deadline_proposal || '-'}

4. DESKRIPSI & TUJUAN
${formData.description}

5. PERSYARATAN KHUSUS & TEKNIS
${formData.special_requirements || '-'}

6. LAMPIRAN DOKUMEN
Link: ${formData.doc_link || '(Tidak ada lampiran)'}
            `.trim();

            const payload = {
                name: formData.name,
                location: formData.location,
                event_date: formData.event_date,
                budget_limit: parseInt(formData.budget_limit),
                description: detailedDescription,
                vendor_username: targetVendor.username
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
        <div className="min-h-screen bg-[#F8FAFC] py-10 font-sans text-[#251E3B]">
            <div className="max-w-4xl mx-auto px-4">
                
                {/* Header Navigasi */}
                <button onClick={() => navigate(-1)} className="mb-6 text-sm text-[#251E3B]/60 hover:text-[#FF9206] flex items-center gap-2 font-bold transition-colors">
                    <Icons.Back /> Batal & Kembali
                </button>

                <div className="bg-white p-10 rounded-3xl shadow-sm border border-[#251E3B]/5">
                    <div className="border-b border-gray-100 pb-6 mb-8 flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-extrabold text-[#251E3B] mb-2">Buat Brief Proyek</h2>
                            <p className="text-gray-500">Lengkapi detail agar Vendor dapat memberikan penawaran akurat.</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                            <Icons.Edit />
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-10">
                        
                        {/* BAGIAN 1: INFO DASAR */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-[#251E3B]/10 p-2 rounded-lg"><Icons.Info /></span>
                                <h3 className="text-lg font-bold text-[#251E3B]">Informasi Utama</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="label-style">Nama Proyek / Judul Event</label>
                                    <input name="name" type="text" required className="input-style" onChange={handleChange} placeholder="Contoh: Launching Produk A" />
                                </div>
                                <div>
                                    <label className="label-style">Kategori Event</label>
                                    <select name="category" className="input-style bg-white" onChange={handleChange}>
                                        <option>Corporate Event</option>
                                        <option>Wedding / Engagement</option>
                                        <option>Concert / Festival</option>
                                        <option>Seminar / Conference</option>
                                        <option>Exhibition</option>
                                        <option>Private Party</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label-style">Estimasi Jumlah Peserta</label>
                                    <input name="audience_count" type="number" className="input-style" onChange={handleChange} placeholder="Contoh: 150" />
                                </div>
                            </div>
                        </section>

                        <div className="border-t border-gray-100"></div>

                        {/* BAGIAN 2: DETAIL TEKNIS */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-[#251E3B]/10 p-2 rounded-lg"><Icons.Tool /></span>
                                <h3 className="text-lg font-bold text-[#251E3B]">Detail Kebutuhan Teknis</h3>
                            </div>
                            
                            <div>
                                <label className="label-style mb-3 block">Layanan yang Diperlukan</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {serviceOptions.map((service) => (
                                        <label key={service} className="flex items-center space-x-3 cursor-pointer bg-[#F8FAFC] p-3 rounded-xl border border-gray-200 hover:border-[#FF9206] hover:bg-white transition-all group">
                                            <input type="checkbox" className="w-5 h-5 text-[#FF9206] rounded focus:ring-[#FF9206] border-gray-300" onChange={() => handleServiceChange(service)} />
                                            <span className="text-sm font-medium text-gray-600 group-hover:text-[#251E3B] transition-colors">{service}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="label-style">Deskripsi Singkat & Tujuan</label>
                                <textarea name="description" rows="3" required className="input-style" onChange={handleChange} placeholder="Jelaskan tujuan acara secara umum..."></textarea>
                            </div>

                            <div>
                                <label className="label-style">Persyaratan Khusus (Opsional)</label>
                                <textarea name="special_requirements" rows="2" className="input-style" onChange={handleChange} placeholder="Contoh: Harus bersertifikat Halal, Sound system min 5000 watt..."></textarea>
                            </div>
                        </section>

                        <div className="border-t border-gray-100"></div>

                        {/* BAGIAN 3: LOGISTIK */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-[#251E3B]/10 p-2 rounded-lg"><Icons.Map /></span>
                                <h3 className="text-lg font-bold text-[#251E3B]">Logistik & Waktu</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                        <div className="border-t border-gray-100"></div>

                        {/* BAGIAN 4: ANGGARAN */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-[#251E3B]/10 p-2 rounded-lg"><Icons.Money /></span>
                                <h3 className="text-lg font-bold text-[#251E3B]">Anggaran & Dokumen</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label-style">Pagu Anggaran (Rp)</label>
                                    <input name="budget_limit" type="number" required className="input-style font-bold text-[#251E3B]" onChange={handleChange} placeholder="15000000" />
                                </div>
                                <div>
                                    <label className="label-style">Deadline Proposal</label>
                                    <input name="deadline_proposal" type="date" className="input-style" onChange={handleChange} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="label-style">Link Dokumen Pendukung</label>
                                    <input name="doc_link" type="text" className="input-style text-blue-600 underline" onChange={handleChange} placeholder="https://drive.google.com/..." />
                                    <p className="text-xs text-gray-400 mt-2 ml-1">Lampirkan rundown, moodboard, atau layout venue.</p>
                                </div>
                            </div>
                        </section>

                        <div className="pt-8">
                            <button type="submit" disabled={loading} className="w-full py-4 bg-[#FF9206] hover:bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex justify-center items-center gap-2 disabled:bg-gray-300 disabled:shadow-none">
                                {loading ? 'Mengirim Data...' : <><Icons.Send /> Kirim Brief Proyek</>}
                            </button>
                        </div>
                    </form>
                </div>
                
                {/* CSS IN JS */}
                <style>{`
                    .label-style { display: block; font-size: 0.875rem; font-weight: 700; color: #251E3B; margin-bottom: 0.5rem; letter-spacing: 0.02em; }
                    .input-style { 
                        width: 100%; padding: 0.875rem 1rem; 
                        background-color: #F8FAFC;
                        border: 1px solid #E2E8F0; 
                        border-radius: 0.75rem; 
                        outline: none; 
                        transition: all 0.2s;
                        color: #334155;
                        font-weight: 500;
                    }
                    .input-style:focus { 
                        background-color: #FFFFFF;
                        border-color: #FF9206; 
                        box-shadow: 0 0 0 4px rgba(255, 146, 6, 0.1); 
                    }
                    .input-style::placeholder { color: #94A3B8; font-weight: 400; }
                `}</style>
            </div>
        </div>
    );
};

export default ProjectBrief;