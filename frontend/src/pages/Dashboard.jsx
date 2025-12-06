import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        try {
        const res = await client.get(ENDPOINTS.PROJECTS.LIST);
        setProjects(res.data);
        } catch (error) {
        console.error("Error fetching projects:", error);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleSendProposal = async () => {
        if (!selectedProject) return;

        const proposalData = {
        price: selectedProject.budget_limit || 10000000, 
        scope: "Full Service sesuai request",
        timeline: "1 Hari Acara"
        };

        try {
        if(confirm(`Ambil proyek "${selectedProject.name}" dan kirim penawaran awal?`)) {
            await client.post(ENDPOINTS.PROJECTS.SEND_PROPOSAL(selectedProject.id), proposalData);
            alert("Proposal dikirim! Status proyek sekarang NEGOTIATING.");
            
            fetchProjects(); // Refresh agar status berubah
            setSelectedProject(null); // Reset pilihan
        }
        } catch (error) {
        console.error("Gagal kirim proposal:", error);
        alert("Gagal mengambil proyek. Cek console.");
        }
    };

    const handleGenerateMoU = async () => {
        if (!selectedProject) return;
        try {
        await client.post(ENDPOINTS.MOU.GENERATE(selectedProject.id));
        alert("MoU berhasil dibuat! Menunggu review Client.");
        fetchProjects();
        setSelectedProject(null);
        } catch (error) {
        alert("Gagal membuat MoU. Pastikan status proyek NEGOTIATING.");
        }
    };

    const getStatusBadge = (status) => {
        const map = {
        'BRIEF': 'bg-gray-200 text-gray-700', 
        'NEGOTIATING': 'bg-orange-100 text-orange-800',
        'MOU_DRAFT': 'bg-blue-100 text-blue-800',
        'READY_TO_SIGN': 'bg-purple-100 text-purple-800',
        'ACTIVE': 'bg-green-100 text-green-800' 
        };
        return <span className={`px-2 py-1 rounded text-xs font-bold ${map[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    return (
        <div className="flex h-[85vh] gap-6">
        <div className="w-1/3 bg-white border border-gray-200 rounded-lg overflow-y-auto">
            <div className="p-4 border-b bg-gray-50"><h2 className="font-bold text-gray-700">Proyek Saya</h2></div>
            
            {loading ? <p className="p-4">Memuat data...</p> : (
            <ul>
                {projects.map(p => (
                <li key={p.id} onClick={() => setSelectedProject(p)} 
                    className={`p-4 border-b cursor-pointer hover:bg-indigo-50 transition-colors ${selectedProject?.id === p.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''}`}>
                    <div className="flex justify-between mb-1">
                    <h3 className="font-semibold truncate text-gray-900">{p.name}</h3>
                    {getStatusBadge(p.status)}
                    </div>
                    <p className="text-xs text-gray-500">{p.location} • {p.event_date}</p>
                </li>
                ))}
                {projects.length === 0 && <p className="p-4 text-gray-500 text-center">Belum ada proyek.</p>}
            </ul>
            )}
        </div>

        <div className="w-2/3 bg-white border border-gray-200 rounded-lg flex flex-col">
            {selectedProject ? (
            <>
                <div className="p-5 border-b bg-gray-50 flex justify-between items-center rounded-t-lg">
                <div>
                    <h2 className="font-bold text-xl text-gray-800">{selectedProject.name}</h2>
                    <p className="text-sm text-gray-500">Status: <span className="font-medium">{selectedProject.status}</span></p>
                </div>

                <div className="flex gap-2">
                    {user.role === 'vendor' && selectedProject.status === 'BRIEF' && (
                    <button onClick={handleSendProposal} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded shadow font-bold text-sm transition-transform active:scale-95">
                        🚀 Ambil Proyek
                    </button>
                    )}

                    {user.role === 'vendor' && selectedProject.status === 'NEGOTIATING' && (
                    <button onClick={handleGenerateMoU} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow font-bold text-sm">
                        📄 Buat MoU Digital
                    </button>
                    )}

                    {user.role === 'client' && selectedProject.status === 'MOU_DRAFT' && (
                    <button onClick={() => navigate(`/sign-mou/${selectedProject.id}`)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow font-bold text-sm">
                        🔍 Review MoU
                    </button>
                    )}

                    {selectedProject.status === 'READY_TO_SIGN' && (
                    <button onClick={() => navigate(`/sign-mou/${selectedProject.id}`)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow font-bold text-sm">
                        ✍️ Tanda Tangan
                    </button>
                    )}
                    
                    {selectedProject.status === 'ACTIVE' && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded border border-green-200 text-sm font-bold">
                        ✅ Proyek Berjalan
                    </span>
                    )}
                </div>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
                    <h3 className="text-blue-800 font-bold mb-2 text-sm uppercase tracking-wide">Detail Kebutuhan Client</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedProject.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg bg-gray-50">
                    <span className="block text-xs text-gray-500 uppercase font-bold">Budget Limit</span>
                    <span className="text-lg font-semibold text-gray-800">Rp {selectedProject.budget_limit?.toLocaleString()}</span>
                    </div>
                    <div className="p-4 border rounded-lg bg-gray-50">
                    <span className="block text-xs text-gray-500 uppercase font-bold">Lokasi Acara</span>
                    <span className="text-lg font-semibold text-gray-800">{selectedProject.location}</span>
                    </div>
                    <div className="p-4 border rounded-lg bg-gray-50">
                    <span className="block text-xs text-gray-500 uppercase font-bold">Tanggal</span>
                    <span className="text-lg font-semibold text-gray-800">{selectedProject.event_date}</span>
                    </div>
                </div>
                </div>
            </>
            ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50 rounded-r-lg">
                <svg className="w-16 h-16 mb-4 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                <p>Pilih proyek di menu kiri untuk melihat detail.</p>
            </div>
            )}
        </div>
        </div>
    );
};

export default Dashboard;