import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const ProjectBrief = () => {
    const { vendorId } = useParams(); 
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',     
        location: '',  
        event_date: '',
        budget_limit: '',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
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
        <div className="max-w-4xl mx-auto mt-6">
            <button 
                onClick={() => navigate('/dashboard')} 
                className="mb-4 flex items-center text-gray-500 hover:text-indigo-600 transition-colors font-medium ml-1"
            >
                ← Kembali ke Dashboard
            </button>

            <div className="bg-white shadow-lg rounded p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="md:col-span-2 border p-8 bg-gray-50 h-[80vh] overflow-y-auto font-serif text-sm leading-relaxed text-justify">
                    <div className="text-center mb-6">
                        <h1 className="font-bold text-xl underline">MEMORANDUM OF UNDERSTANDING</h1>
                        <p className="text-xs text-gray-500 mt-1">Ref: MOU-{mouId || '???'}/{project.id}</p>
                    </div>
                    
                    <p className="mb-4">
                        Perjanjian kerjasama ini dibuat pada tanggal <strong>{new Date().toLocaleDateString('id-ID')}</strong> untuk pelaksanaan proyek:
                    </p>

                    <div className="bg-white border p-4 mb-4 rounded">
                        <table className="w-full text-left">
                            <tbody>
                                <tr><td className="w-32 font-bold">Nama Acara</td><td>: {project.name}</td></tr>
                                <tr><td className="font-bold">Lokasi</td><td>: {project.location}</td></tr>
                                <tr><td className="font-bold">Tanggal</td><td>: {project.event_date}</td></tr>
                                <tr><td className="font-bold">Nilai Kontrak</td><td>: Rp {project.budget_limit.toLocaleString()}</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <h3 className="font-bold mt-4">Pasal 1: Lingkup Pekerjaan</h3>
                    <p>{project.description}</p>
                    
                    <h3 className="font-bold mt-4">Pasal 2: Pembayaran</h3>
                    <p>Pembayaran dilakukan melalui Escrow EventGuard dengan termin: DP 50%, Termin 2 20%, Pelunasan 30%.</p>

                    <div className="mt-10 pt-10 border-t text-center text-gray-400 italic">
                        -- Akhir Dokumen --
                    </div>
                </div>

                <div className="md:col-span-1 flex flex-col gap-4">
                    
                    <div className={`p-4 rounded border ${status === 'ACTIVE' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                        <h3 className="font-bold mb-1 text-gray-700">Status Proyek</h3>
                        <span className="font-mono text-sm font-semibold">{status}</span>
                    </div>

                    {status === 'MOU_DRAFT' && isClient && (
                        <div className="bg-white border p-4 rounded shadow-sm">
                            <h3 className="font-bold mb-2 border-b pb-2">Aksi Diperlukan</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Mohon pelajari dokumen. Anda dapat menyetujui atau meminta revisi.
                            </p>
                            <div className="flex flex-col gap-2">
                                <button onClick={handleRevise} className="w-full border border-red-300 text-red-600 py-2 rounded text-sm hover:bg-red-50 font-medium">
                                    Minta Revisi
                                </button>
                                <button onClick={handleApprove} className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 font-bold shadow">
                                    ✅ Setujui (Approve)
                                </button>
                            </div>
                        </div>
                    )}

                    {status === 'READY_TO_SIGN' && (
                        <div className="bg-white border p-4 rounded shadow-sm">
                            <h3 className="font-bold mb-2 border-b pb-2">Tanda Tangan</h3>
                            <input 
                                type="text" 
                                placeholder="Ketik Nama Lengkap"
                                className="w-full border p-2 rounded mb-2 text-sm bg-gray-50"
                                value={signedName}
                                onChange={(e) => setSignedName(e.target.value)}
                            />
                            <label className="flex items-start gap-2 text-sm mb-4 cursor-pointer select-none">
                                <input type="checkbox" className="mt-1" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} />
                                <span>Saya menyetujui isi MoU ini secara sadar dan sah secara hukum digital.</span>
                            </label>
                            <button 
                                onClick={handleSign}
                                disabled={!isAgreed || !signedName}
                                className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow transition-colors"
                            >
                                ✍️ Tanda Tangan Sekarang
                            </button>
                        </div>
                    )}

                    {status === 'ACTIVE' && (
                        <div className="bg-green-50 p-6 rounded border border-green-200 text-center shadow-sm">
                            <div className="text-4xl mb-2">🤝</div>
                            <h3 className="font-bold text-green-800">Sah & Aktif</h3>
                            <p className="text-sm text-green-700 mt-1">Proyek ini telah berjalan.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectBrief;