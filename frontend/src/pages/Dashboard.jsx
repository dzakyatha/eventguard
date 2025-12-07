import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import ChatBubble from '../components/ChatBubble'; 
import html2pdf from 'html2pdf.js';

// --- KOLEKSI IKON SVG (PENGGANTI EMOJI) ---
const Icons = {
  Home: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Brief: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  Chat: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  Money: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Doc: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Send: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  Calendar: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Lock: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  User: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Folder: () => <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>,
  Alert: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Pencil: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Rocket: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Trash: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null); 
  const [showMouModal, setShowMouModal] = useState(false);
  const [vendorMouData, setVendorMouData] = useState({ nama: '', alamat: '', id_no: '' });

  // --- FETCH DATA ---
  const fetchProjects = async () => {
    try {
      const res = await client.get(ENDPOINTS.PROJECTS.LIST);
      setProjects(res.data);
    } catch (error) { console.error("Error:", error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  // --- CHAT LOGIC ---
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

  // --- ACTIONS ---
  const handleSendProposal = async () => {
    if (!selectedProject) return;
    const proposalData = { price: selectedProject.budget_limit || 10000000, scope: "Full Service", timeline: "1 Hari" };
    if(confirm(`Ambil proyek ini?`)) {
        await client.post(ENDPOINTS.PROJECTS.SEND_PROPOSAL(selectedProject.id), proposalData);
        fetchProjects(); setSelectedProject(null);
    }
  };

  const handleGenerateMoU = () => {
    setVendorMouData({ nama: user.username, alamat: '', id_no: '' }); 
    setShowMouModal(true);
  };

  const submitMouGeneration = async () => {
    if (!vendorMouData.nama || !vendorMouData.alamat || !vendorMouData.id_no) return alert("Lengkapi data.");
    try {
        localStorage.setItem(`mou_vendor_${selectedProject.id}`, JSON.stringify(vendorMouData));
        await client.post(ENDPOINTS.MOU.GENERATE(selectedProject.id));
        alert("MoU berhasil dibuat!");
        setShowMouModal(false);
        fetchProjects(); 
        setSelectedProject(null);
    } catch (error) { alert("Gagal buat MoU."); }
  };

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

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    
    if (!confirm(`Apakah Anda yakin ingin MENGHAPUS proyek "${selectedProject.name}"?`)) return;
    if (!confirm("Tindakan ini tidak dapat dibatalkan. Yakin hapus?")) return;

    try {
        await client.delete(ENDPOINTS.PROJECTS.DETAIL(selectedProject.id));
        alert("Proyek berhasil dihapus.");
        setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
        setSelectedProject(null);
    } catch (error) {
        console.error("Gagal hapus:", error);
        alert("Gagal menghapus proyek. Pastikan Backend sudah memiliki endpoint DELETE.");
    }
  };

  // Helpers
  const formatRupiah = (num) => "Rp " + (num || 0).toLocaleString('id-ID');
  const getProgressStep = (status) => {
    const steps = { 'BRIEF': 1, 'NEGOTIATING': 2, 'MOU_DRAFT': 2, 'MOU_REVISION': 2, 'READY_TO_SIGN': 3, 'ACTIVE': 4, 'COMPLETED': 5 };
    return steps[status] || 0;
  };

  return (
    // FIX SCROLLBAR: Gunakan 'h-screen w-full overflow-hidden'
    <div className="flex h-screen w-full overflow-hidden font-sans text-[#251E3B] bg-[#F8FAFC]">
      
      {/* === SIDEBAR (FIXED WIDTH) === */}
      <div className="w-80 h-full bg-white border-r border-[#251E3B]/10 flex flex-col z-20 shadow-sm">
        <div className="p-6 border-b border-[#251E3B]/10">
            <h2 className="text-xl font-bold flex items-center gap-2 text-[#251E3B]">
                <span className="bg-[#FF9206]/10 text-[#FF9206] p-2 rounded-xl"><Icons.Brief /></span>
                Proyek Saya
            </h2>
            <p className="text-xs text-[#251E3B]/50 mt-1 ml-11">{projects.length} Proyek Aktif</p>
        </div>
        {/* Scroll hanya di dalam list */}
        <ul className="flex-1 overflow-y-auto p-4 space-y-2">
          {projects.map(p => (
            <li key={p.id} onClick={() => { setSelectedProject(p); setActiveTab('overview'); }} 
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${selectedProject?.id === p.id ? 'bg-white shadow-lg border-[#FF9206]/30 ring-1 ring-[#FF9206]/20' : 'hover:bg-gray-50 border-transparent'}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-bold text-sm truncate w-2/3 ${selectedProject?.id === p.id ? 'text-[#FF9206]' : 'text-[#251E3B]'}`}>{p.name}</h3>
                <span className={`text-[10px] px-2 py-1 rounded-lg font-bold ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {p.status === 'ACTIVE' ? 'Aktif' : 'Proses'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#251E3B]/50">
                <Icons.Calendar /> <span>{p.event_date}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* === MAIN CONTENT (FLEXIBLE) === */}
      <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#F8FAFC]">
        {selectedProject ? (
          <>
            {/* HEADER PROYEK */}
            <div className="px-8 py-6 bg-white border-b border-[#251E3B]/10 shadow-sm shrink-0">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#251E3B] mb-2 tracking-tight">{selectedProject.name}</h1>
                        <div className="flex items-center gap-4 text-sm text-[#251E3B]/60">
                            <span className="flex items-center gap-1 bg-[#F8FAFC] px-3 py-1 rounded-full border border-[#251E3B]/5"><Icons.Calendar /> {selectedProject.event_date}</span>
                            <span className="flex items-center gap-1"><Icons.User /> Vendor: <strong className="text-[#251E3B]">{selectedProject.vendor_id ? `#${selectedProject.vendor_id}` : '-'}</strong></span>
                        </div>
                    </div>
                    
                    {/* BUTTONS (NO EMOJI) */}
                    <div className="flex gap-3">
                        {user.role === 'vendor' && selectedProject.status === 'BRIEF' && 
                            <button onClick={handleSendProposal} className="px-6 py-2.5 bg-[#FF9206] hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2"><Icons.Rocket /> Ambil Proyek</button>}
                        
                        {(selectedProject.status === 'NEGOTIATING' || selectedProject.status === 'MOU_REVISION') && user.role === 'vendor' && 
                            <button onClick={handleGenerateMoU} className="px-6 py-2.5 bg-[#251E3B] hover:bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-500/20 transition-all flex items-center gap-2"><Icons.Doc /> Buat MoU</button>}
                        
                        {selectedProject.status === 'MOU_DRAFT' && user.role === 'client' && 
                            <button onClick={() => navigate(`/sign-mou/${selectedProject.id}`)} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg flex items-center gap-2"><Icons.Search /> Review MoU</button>}
                        
                        {selectedProject.status === 'READY_TO_SIGN' && 
                            <button onClick={() => navigate(`/sign-mou/${selectedProject.id}`)} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg flex items-center gap-2"><Icons.Pencil /> Tanda Tangan</button>}
                        
                        {selectedProject.status === 'ACTIVE' && 
                            <button onClick={() => navigate(`/sign-mou/${selectedProject.id}`)} className="px-6 py-2.5 bg-[#251E3B] hover:bg-slate-900 text-white rounded-xl font-bold shadow-lg flex items-center gap-2"><Icons.Doc /> Lihat Kontrak</button>}
                        
                        <button 
                            onClick={handleDeleteProject} 
                            className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100"
                            title="Hapus Proyek"
                        >
                            <Icons.Trash />
                        </button>
                    </div>
                </div>

                {/* PROGRESS TRACKER */}
                <div className="mt-8 relative px-2">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full"></div>
                    <div className="absolute top-1/2 left-0 h-1 bg-[#FF9206] -translate-y-1/2 rounded-full transition-all duration-1000" style={{width: `${(getProgressStep(selectedProject.status)/5)*100}%`}}></div>
                    <div className="flex justify-between relative z-10">
                        {['Proposal', 'Agreement', 'Payment', 'Execution', 'Done'].map((step, idx) => {
                            const active = idx + 1 <= getProgressStep(selectedProject.status);
                            return (
                                <div key={idx} className="flex flex-col items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all ${active ? 'bg-[#FF9206] border-orange-100 text-white' : 'bg-white border-slate-100 text-slate-300'}`}>
                                        {active ? <Icons.Check /> : <span className="text-xs font-bold">{idx+1}</span>}
                                    </div>
                                    <span className={`text-xs font-bold ${active ? 'text-[#FF9206]' : 'text-slate-300'}`}>{step}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex px-8 border-b border-[#251E3B]/10 bg-white shrink-0">
                {[
                    {id: 'overview', label: 'Overview', icon: Icons.Home},
                    {id: 'financial', label: 'Keuangan', icon: Icons.Money},
                    {id: 'documents', label: 'Dokumen', icon: Icons.Doc},
                    {id: 'chat', label: 'Diskusi', icon: Icons.Chat}
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
                        className={`flex items-center gap-2 py-4 px-6 text-sm font-bold border-b-2 transition-all ${activeTab === tab.id ? 'border-[#FF9206] text-[#FF9206]' : 'border-transparent text-[#251E3B]/40 hover:text-[#251E3B]/80'}`}>
                        <tab.icon /> {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTENT AREA (SCROLLABLE) */}
            <div className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
                
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#251E3B]/5">
                                <h3 className="font-bold text-[#251E3B] mb-4 text-lg flex items-center gap-2"><Icons.Doc /> Detail Brief</h3>
                                <div className="p-5 bg-[#F8FAFC] rounded-xl text-[#251E3B]/80 text-sm leading-relaxed whitespace-pre-wrap border border-[#251E3B]/5">
                                    {selectedProject.description}
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#251E3B]/5">
                                <h3 className="font-bold text-[#251E3B] mb-4 flex items-center gap-2"><Icons.Check /> Action Items</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 p-3 bg-red-50 rounded-xl text-xs font-bold text-red-600 border border-red-100">
                                        <Icons.Alert /> Deadline Proposal (H-2)
                                    </li>
                                    <li className="flex items-center gap-3 p-3 bg-green-50 rounded-xl text-xs font-bold text-green-600 border border-green-100">
                                        <Icons.Check /> Venue Confirmed
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'financial' && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#251E3B]/5">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-[#251E3B] text-xl flex items-center gap-2"><Icons.Money /> Escrow Payment</h3>
                            <div className="text-right">
                                <p className="text-xs text-[#251E3B]/40 uppercase font-bold">Total Nilai Proyek</p>
                                <p className="text-2xl font-extrabold text-[#251E3B]">{formatRupiah(selectedProject.budget_limit)}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[{label: 'Termin 1 (DP)', pct: '50%', status: 'unpaid'}, {label: 'Termin 2', pct: '30%', status: 'locked'}, {label: 'Pelunasan', pct: '20%', status: 'locked'}].map((t, idx) => (
                                <div key={idx} className="flex justify-between items-center p-5 border border-[#251E3B]/5 rounded-xl hover:shadow-md transition-all bg-white">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                            <span className="font-bold">{idx+1}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#251E3B]">{t.label}</p>
                                            <p className="text-xs text-[#251E3B]/50">Sebesar {t.pct} dari total</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${t.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{t.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#251E3B]/5 hover:border-[#FF9206]/30 transition-all group cursor-pointer" onClick={handleDownloadBrief}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-red-50 text-red-500 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-colors"><Icons.Doc /></div>
                                <span className="text-xs font-bold text-[#251E3B]/30">PDF</span>
                            </div>
                            <h4 className="font-bold text-[#251E3B] mb-1">Project Brief</h4>
                            <p className="text-xs text-[#251E3B]/50">Created {selectedProject.event_date}</p>
                        </div>
                        {(selectedProject.status === 'ACTIVE' || selectedProject.status === 'READY_TO_SIGN') && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#251E3B]/5 hover:border-blue-200 transition-all group cursor-pointer" onClick={() => navigate(`/sign-mou/${selectedProject.id}`)}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-blue-50 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors"><Icons.Doc /></div>
                                    <span className="text-xs font-bold text-[#251E3B]/30">PDF</span>
                                </div>
                                <h4 className="font-bold text-[#251E3B] mb-1">Legal Contract (MoU)</h4>
                                <p className="text-xs text-[#251E3B]/50">Signed Document</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#251E3B]/10 shadow-sm overflow-hidden">
                        <div className="p-3 bg-[#F8FAFC] border-b border-[#251E3B]/10 text-xs text-[#251E3B]/50 text-center flex items-center justify-center gap-2">
                            <Icons.Lock /> Chat ini terenkripsi end-to-end
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#F8FAFC]">
                            {messages.map(msg => <ChatBubble key={msg.id} message={msg} isMe={msg.sender_username === user.username} />)}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-[#251E3B]/10 flex gap-3">
                            <input type="text" className="flex-1 bg-[#F8FAFC] border border-[#251E3B]/10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9206]/20 text-sm" placeholder="Tulis pesan..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                            <button type="submit" className="bg-[#FF9206] text-white p-3 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"><Icons.Send /></button>
                        </form>
                    </div>
                )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[#251E3B]/30">
            <div className="w-24 h-24 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-4 text-[#251E3B]/20">
                <Icons.Folder />
            </div>
            <p className="font-medium">Pilih proyek di menu kiri untuk melihat detail.</p>
          </div>
        )}
      </div>

      {/* MODAL VENDOR DATA */}
      {showMouModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#251E3B]/60 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md animate-fade-in-up transform transition-all">
                <h3 className="text-xl font-bold text-[#251E3B] mb-2">Lengkapi Data Usaha</h3>
                <p className="text-sm text-[#251E3B]/50 mb-6">Data ini dibutuhkan untuk generate kontrak legal.</p>
                <div className="space-y-4">
                    <input type="text" className="w-full border-[#251E3B]/10 bg-[#F8FAFC] p-3 rounded-xl focus:ring-2 focus:ring-[#FF9206]/20 outline-none" placeholder="Nama Perusahaan" value={vendorMouData.nama} onChange={e => setVendorMouData({...vendorMouData, nama: e.target.value})} />
                    <input type="text" className="w-full border-[#251E3B]/10 bg-[#F8FAFC] p-3 rounded-xl focus:ring-2 focus:ring-[#FF9206]/20 outline-none" placeholder="Alamat Lengkap" value={vendorMouData.alamat} onChange={e => setVendorMouData({...vendorMouData, alamat: e.target.value})} />
                    <input type="text" className="w-full border-[#251E3B]/10 bg-[#F8FAFC] p-3 rounded-xl focus:ring-2 focus:ring-[#FF9206]/20 outline-none" placeholder="No. NIB / NPWP" value={vendorMouData.id_no} onChange={e => setVendorMouData({...vendorMouData, id_no: e.target.value})} />
                </div>
                <div className="flex gap-3 mt-8">
                    <button onClick={() => setShowMouModal(false)} className="flex-1 py-3 text-[#251E3B]/50 font-bold hover:bg-slate-50 rounded-xl">Batal</button>
                    <button onClick={submitMouGeneration} className="flex-1 py-3 bg-[#FF9206] text-white rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/20">Simpan & Buat</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;