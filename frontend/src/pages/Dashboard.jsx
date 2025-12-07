import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import ChatBubble from '../components/ChatBubble'; 
import html2pdf from 'html2pdf.js'; // Pastikan import ini ada

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tab: 'overview', 'financial', 'documents', 'chat'
  const [activeTab, setActiveTab] = useState('overview'); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null); 

  const [showMouModal, setShowMouModal] = useState(false);
  const [vendorMouData, setVendorMouData] = useState({ nama: '', alamat: '', id_no: '' });

  // --- 1. FETCH DATA ---
  const fetchProjects = async () => {
    try {
      const res = await client.get(ENDPOINTS.PROJECTS.LIST);
      setProjects(res.data);
    } catch (error) { console.error("Error:", error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  // --- 2. LOGIC CHAT ---
  useEffect(() => {
    if (selectedProject && activeTab === 'chat') {
      const fetchMessages = async () => {
        try {
          const res = await client.get(ENDPOINTS.PROJECTS.MESSAGES(selectedProject.id));
          setMessages(res.data);
          chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        } catch (error) { console.error("Chat error", error); }
      };
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedProject, activeTab]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await client.post(ENDPOINTS.PROJECTS.MESSAGES(selectedProject.id), { text: newMessage });
      setNewMessage("");
      const res = await client.get(ENDPOINTS.PROJECTS.MESSAGES(selectedProject.id));
      setMessages(res.data);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) { alert("Gagal kirim pesan."); }
  };

  // --- 3. LOGIC ACTIONS ---
  const handleSendProposal = async () => {
    if (!selectedProject) return;
    const proposalData = { price: selectedProject.budget_limit || 10000000, scope: "Full Service", timeline: "1 Hari" };
    if(confirm(`Ambil proyek ini?`)) {
        await client.post(ENDPOINTS.PROJECTS.SEND_PROPOSAL(selectedProject.id), proposalData);
        fetchProjects(); setSelectedProject(null);
    }
  };

  const handleGenerateMoU = () => {
    // Buka modal dulu, jangan langsung API
    setVendorMouData({ nama: user.username, alamat: '', id_no: '' }); // Reset form
    setShowMouModal(true);
  };

  const submitMouGeneration = async () => {
    if (!vendorMouData.nama || !vendorMouData.alamat || !vendorMouData.id_no) {
        return alert("Mohon lengkapi data usaha Anda.");
    }

    try {
        // 1. Simpan data vendor ke LocalStorage (Kuncinya pakai ID Project)
        localStorage.setItem(`mou_vendor_${selectedProject.id}`, JSON.stringify(vendorMouData));

        // 2. Panggil API Backend
        await client.post(ENDPOINTS.MOU.GENERATE(selectedProject.id));
        
        alert("MoU berhasil dibuat dengan data Anda!");
        setShowMouModal(false); // Tutup modal
        fetchProjects(); 
        setSelectedProject(null);
    } catch (error) { 
        alert("Gagal buat MoU."); 
        console.error(error);
    }
  };

  // --- 4. FITUR BARU: DOWNLOAD PROJECT BRIEF PDF ---
  const handleDownloadBrief = () => {
    if (!selectedProject) return;

    // 1. Buat Template HTML untuk PDF (Virtual Element)
    const element = document.createElement('div');
    element.innerHTML = `
        <div style="padding: 30px; font-family: Arial, sans-serif; color: #333;">
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px;">
                <h1 style="margin: 0; color: #4F46E5;">PROJECT BRIEF DOCUMENT</h1>
                <p style="margin: 5px 0 0; color: #666;">EventGuard Platform Generated</p>
            </div>

            <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px; font-weight: bold; width: 150px;">Project ID</td>
                    <td style="padding: 8px;">: #${selectedProject.id}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: bold;">Nama Event</td>
                    <td style="padding: 8px;">: ${selectedProject.name}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: bold;">Tanggal Acara</td>
                    <td style="padding: 8px;">: ${selectedProject.event_date}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: bold;">Lokasi</td>
                    <td style="padding: 8px;">: ${selectedProject.location}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: bold;">Budget Limit</td>
                    <td style="padding: 8px;">: Rp ${selectedProject.budget_limit?.toLocaleString()}</td>
                </tr>
            </table>

            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <h3 style="margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Detail & Spesifikasi</h3>
                <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; line-height: 1.5; color: #4b5563;">${selectedProject.description}</pre>
            </div>

            <div style="margin-top: 40px; font-size: 10px; color: #999; text-align: center;">
                Dokumen ini digenerate secara otomatis dari sistem EventGuard pada ${new Date().toLocaleString()}.
            </div>
        </div>
    `;

    // 2. Konfigurasi PDF
    const opt = {
        margin:       [10, 10, 10, 10],
        filename:     `Brief-${selectedProject.name.replace(/\s+/g, '-')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 3. Proses Download
    html2pdf().set(opt).from(element).save();
  };

  // --- 5. HELPERS VISUAL ---
  const getProgressStep = (status) => {
    switch(status) {
        case 'BRIEF': return 1;
        case 'NEGOTIATING': return 2;
        case 'MOU_DRAFT': return 2; 
        case 'MOU_REVISION': return 2;
        case 'READY_TO_SIGN': return 3;
        case 'ACTIVE': return 4;
        case 'COMPLETED': return 5;
        default: return 0;
    }
  };

  const formatRupiah = (num) => "Rp " + (num || 0).toLocaleString('id-ID');

  return (
    <div className="flex h-[85vh] gap-6 font-sans text-gray-800">
      {/* === SIDEBAR LIST PROYEK === */}
      <div className="w-1/4 bg-white border border-gray-200 rounded-xl overflow-y-auto shadow-sm">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center sticky top-0 z-10">
            <h2 className="font-bold text-gray-700">🗂️ Proyek Saya</h2>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-bold">{projects.length}</span>
        </div>
        <ul>
          {projects.map(p => (
            <li key={p.id} onClick={() => { setSelectedProject(p); setActiveTab('overview'); }} 
                className={`p-4 border-b cursor-pointer transition-all hover:bg-gray-50 ${selectedProject?.id === p.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''}`}>
              <div className="flex justify-between mb-1">
                <h3 className="font-bold text-sm truncate w-2/3">{p.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full h-fit font-bold ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{p.status}</span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">📅 {p.event_date}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="w-3/4 bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden shadow-sm">
        {selectedProject ? (
          <>
            {/* --- PROJECT HEADER --- */}
            <div className="p-6 border-b bg-white">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h1>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded border border-blue-200 font-bold">ID: #{selectedProject.id}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                            Vendor: <span className="font-semibold text-gray-800">{selectedProject.vendor_id ? `Vendor #${selectedProject.vendor_id}` : 'Menunggu Vendor'}</span> • Kategori: <span className="font-semibold">Event Service</span>
                        </p>
                    </div>
                    
                    {/* QUICK ACTION BUTTONS */}
                    <div className="flex gap-2">
                        {user.role === 'vendor' && selectedProject.status === 'BRIEF' && 
                            <button onClick={handleSendProposal} className="btn-action bg-orange-600 hover:bg-orange-700">🚀 Ambil Proyek</button>}
                        
                        {(selectedProject.status === 'NEGOTIATING' || selectedProject.status === 'MOU_REVISION') && user.role === 'vendor' && 
                            <button onClick={handleGenerateMoU} className="btn-action bg-indigo-600 hover:bg-indigo-700">📄 Generate MoU</button>}
                        
                        {selectedProject.status === 'MOU_DRAFT' && user.role === 'client' && 
                            <button onClick={() => navigate(`/sign-mou/${selectedProject.id}`)} className="btn-action bg-blue-600 hover:bg-blue-700">🔍 Review MoU</button>}
                        
                        {selectedProject.status === 'READY_TO_SIGN' && 
                            <button onClick={() => navigate(`/sign-mou/${selectedProject.id}`)} className="btn-action bg-green-600 hover:bg-green-700">✍️ Tanda Tangan</button>}
                        
                        {selectedProject.status === 'ACTIVE' && 
                            <button onClick={() => navigate(`/sign-mou/${selectedProject.id}`)} className="btn-action bg-gray-800 hover:bg-gray-900">📄 Lihat Kontrak</button>}
                    </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="mt-6">
                    <div className="flex justify-between mb-2">
                        {['Proposal', 'Agreement', 'Payment DP', 'Execution', 'Completed'].map((step, idx) => {
                            const currentStep = getProgressStep(selectedProject.status);
                            const isActive = idx + 1 <= currentStep;
                            return (
                                <div key={idx} className={`text-xs font-bold ${isActive ? 'text-indigo-600' : 'text-gray-400'} flex-1 text-center`}>
                                    {step}
                                </div>
                            )
                        })}
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                        {[1, 2, 3, 4, 5].map(step => (
                            <div key={step} className={`h-full flex-1 border-r border-white ${step <= getProgressStep(selectedProject.status) ? 'bg-indigo-500' : 'bg-transparent'}`}></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- TAB NAVIGATION --- */}
            <div className="flex border-b px-6 bg-gray-50 gap-6">
                {['overview', 'financial', 'documents', 'chat'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} 
                        className={`py-4 text-sm font-bold capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* --- TAB CONTENT AREA --- */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                
                {/* TAB: OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* TIMELINE */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">📅 Timeline & Milestone</h3>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                    <p className="text-xs text-green-600 font-bold uppercase">Start Date</p>
                                    <p className="font-bold text-gray-800">{selectedProject.event_date}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-xs text-blue-600 font-bold uppercase">Countdown</p>
                                    <p className="font-bold text-gray-800">12 Hari Lagi</p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                                    <p className="text-xs text-purple-600 font-bold uppercase">Status</p>
                                    <p className="font-bold text-gray-800">{selectedProject.status.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* TASK LIST */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-3">✅ Action Items</h3>
                                <ul className="space-y-3">
                                    {selectedProject.status === 'BRIEF' && <li className="task-item">Vendor: Kirim Proposal Penawaran <span className="badge-pending">Pending</span></li>}
                                    {selectedProject.status === 'MOU_DRAFT' && <li className="task-item">Client: Review Dokumen MoU <span className="badge-urgent">Urgent</span></li>}
                                    {selectedProject.status === 'READY_TO_SIGN' && <li className="task-item">Both: Tanda Tangan Digital <span className="badge-process">In Progress</span></li>}
                                    {selectedProject.status === 'ACTIVE' && (
                                        <>
                                            <li className="task-item line-through text-gray-400">MoU Signed ✅</li>
                                            <li className="task-item">Client: Bayar Termin 1 (DP) <span className="badge-pending">Next</span></li>
                                            <li className="task-item">Vendor: Persiapan Teknis <span className="badge-pending">Pending</span></li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            {/* Detail Deskripsi */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-3">📝 Detail Kebutuhan</h3>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded border h-40 overflow-y-auto">
                                    {selectedProject.description}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: FINANCIAL */}
                {activeTab === 'financial' && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-800 text-lg">💰 Status Keuangan & Escrow</h3>
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                                Total Deal: {formatRupiah(selectedProject.budget_limit)}
                            </span>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                <div><p className="font-bold text-gray-800">Termin 1: Down Payment (50%)</p><p className="text-xs text-gray-500">Dibayarkan saat kontrak aktif</p></div>
                                <div className="text-right"><p className="font-bold text-indigo-600">{formatRupiah(selectedProject.budget_limit * 0.5)}</p><span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Belum Dibayar</span></div>
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg opacity-60">
                                <div><p className="font-bold text-gray-800">Termin 2: Progress 50% (30%)</p><p className="text-xs text-gray-500">Dibayarkan setelah laporan mid-term</p></div>
                                <div className="text-right"><p className="font-bold text-gray-500">{formatRupiah(selectedProject.budget_limit * 0.3)}</p><span className="text-xs text-gray-400">Locked</span></div>
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg opacity-60">
                                <div><p className="font-bold text-gray-800">Termin 3: Pelunasan (20%)</p><p className="text-xs text-gray-500">Dibayarkan setelah serah terima</p></div>
                                <div className="text-right"><p className="font-bold text-gray-500">{formatRupiah(selectedProject.budget_limit * 0.2)}</p><span className="text-xs text-gray-400">Locked</span></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: DOCUMENTS (Download PDF Ada di Sini) */}
                {activeTab === 'documents' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-100 p-3 rounded-lg text-2xl">📄</div>
                                <div>
                                    <p className="font-bold text-gray-800">Project Brief.pdf</p>
                                    <p className="text-xs text-gray-500">Dibuat pada: {selectedProject.event_date}</p>
                                </div>
                            </div>
                            {/* TOMBOL DOWNLOAD */}
                            <button onClick={handleDownloadBrief} className="text-blue-600 font-bold text-sm hover:underline hover:text-blue-800 transition-colors">
                                📥 Download
                            </button>
                        </div>

                        {(selectedProject.status === 'READY_TO_SIGN' || selectedProject.status === 'ACTIVE') && (
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-3 rounded-lg text-2xl">⚖️</div>
                                    <div>
                                        <p className="font-bold text-gray-800">MoU_Contract.pdf</p>
                                        <p className="text-xs text-gray-500">Legal Agreement</p>
                                    </div>
                                </div>
                                <button onClick={() => navigate(`/sign-mou/${selectedProject.id}`)} className="text-blue-600 font-bold text-sm hover:underline">View & Download</button>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: CHAT */}
                {activeTab === 'chat' && (
                    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-3 bg-gray-50 border-b text-xs text-gray-500 text-center">
                            🔒 Chat ini terenkripsi dan dipantau oleh EventGuard untuk keamanan transaksi.
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-2">
                            {messages.length === 0 && <p className="text-center text-gray-400 text-sm mt-10">Mulai diskusi sekarang...</p>}
                            {messages.map(msg => <ChatBubble key={msg.id} message={msg} isMe={msg.sender_username === user.username} />)}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t flex gap-2">
                            <input type="text" className="flex-1 border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Tulis pesan..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700">Kirim</button>
                        </form>
                    </div>
                )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
            <div className="text-6xl mb-4">📂</div>
            <p>Pilih proyek di menu kiri untuk membuka Command Center.</p>
          </div>
        )}
      </div>

    {showMouModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📝 Lengkapi Identitas Usaha</h3>
                <p className="text-sm text-gray-500 mb-6">Data ini akan otomatis dimasukkan ke dalam draf MoU sebagai Pihak Kedua.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Perusahaan / Vendor</label>
                        <input type="text" className="w-full border p-2 rounded" value={vendorMouData.nama} onChange={e => setVendorMouData({...vendorMouData, nama: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Alamat Operasional</label>
                        <input type="text" className="w-full border p-2 rounded" value={vendorMouData.alamat} onChange={e => setVendorMouData({...vendorMouData, alamat: e.target.value})} placeholder="Jl. Contoh No. 123" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">No. NIB / NPWP</label>
                        <input type="text" className="w-full border p-2 rounded" value={vendorMouData.id_no} onChange={e => setVendorMouData({...vendorMouData, id_no: e.target.value})} />
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={() => setShowMouModal(false)} className="flex-1 py-3 border border-gray-300 rounded-lg font-bold text-gray-600 hover:bg-gray-50">Batal</button>
                    <button onClick={submitMouGeneration} className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg">Buat MoU</button>
                </div>
            </div>
        </div>
      )}

      <style>{`
        .btn-action { color: white; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 13px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.2s; }
        .btn-action:active { transform: scale(0.95); }
        .task-item { font-size: 14px; display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
        .badge-pending { background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
        .badge-urgent { background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
        .badge-process { background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
      `}</style>
    </div>
  );
};

export default Dashboard;