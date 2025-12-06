import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import ChatBubble from '../components/ChatBubble'; // Import komponen Chat

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // State untuk Chat & Tab
  const [activeTab, setActiveTab] = useState('detail'); // 'detail' or 'chat'
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null); // Auto-scroll ke bawah

  // --- 1. FETCH PROJECTS ---
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

  // --- 2. FETCH MESSAGES (Saat Tab Chat Aktif) ---
  useEffect(() => {
    if (selectedProject && activeTab === 'chat') {
      const fetchMessages = async () => {
        try {
          const res = await client.get(ENDPOINTS.PROJECTS.MESSAGES(selectedProject.id));
          setMessages(res.data);
          scrollToBottom();
        } catch (error) {
          console.error("Gagal ambil pesan", error);
        }
      };
      fetchMessages();
      
      // Auto-refresh chat setiap 3 detik (Simple Polling)
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedProject, activeTab]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- 3. KIRIM PESAN ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Endpoint 6 Backend: POST /projects/{id}/messages
      await client.post(ENDPOINTS.PROJECTS.MESSAGES(selectedProject.id), {
        text: newMessage,
        sender: user.username 
      });
      setNewMessage("");
      
      // Refresh manual agar langsung muncul
      const res = await client.get(ENDPOINTS.PROJECTS.MESSAGES(selectedProject.id));
      setMessages(res.data);
      scrollToBottom();
    } catch (error) {
      console.error("Gagal kirim pesan:", error);
      alert("Gagal mengirim pesan.");
    }
  };

  // --- FUNGSI TOMBOL AKSI (Sama seperti sebelumnya) ---
  const handleSendProposal = async () => {
    if (!selectedProject) return;
    const proposalData = { price: selectedProject.budget_limit || 10000000, scope: "Full Service", timeline: "1 Hari" };
    try {
      if(confirm(`Ambil proyek "${selectedProject.name}"?`)) {
        await client.post(ENDPOINTS.PROJECTS.SEND_PROPOSAL(selectedProject.id), proposalData);
        alert("Proposal dikirim! Status NEGOTIATING.");
        fetchProjects(); setSelectedProject(null);
      }
    } catch (error) { alert("Gagal ambil proyek."); }
  };

  const handleGenerateMoU = async () => {
    if (!selectedProject) return;
    try {
      await client.post(ENDPOINTS.MOU.GENERATE(selectedProject.id));
      alert("MoU berhasil dibuat!");
      fetchProjects(); setSelectedProject(null);
    } catch (error) { alert("Gagal buat MoU."); }
  };

  const getStatusBadge = (status) => {
    const map = { 'BRIEF': 'bg-gray-200', 'NEGOTIATING': 'bg-orange-100 text-orange-800', 'MOU_DRAFT': 'bg-blue-100 text-blue-800', 'READY_TO_SIGN': 'bg-purple-100 text-purple-800', 'ACTIVE': 'bg-green-100 text-green-800' };
    return <span className={`px-2 py-1 rounded text-xs font-bold ${map[status]}`}>{status}</span>;
  };

  return (
    <div className="flex h-[85vh] gap-6">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border border-gray-200 rounded-lg overflow-y-auto">
        <div className="p-4 border-b bg-gray-50"><h2 className="font-bold text-gray-700">Proyek Saya</h2></div>
        <ul>
          {projects.map(p => (
            <li key={p.id} onClick={() => { setSelectedProject(p); setActiveTab('detail'); }} 
                className={`p-4 border-b cursor-pointer hover:bg-indigo-50 ${selectedProject?.id === p.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''}`}>
              <div className="flex justify-between mb-1"><h3 className="font-semibold truncate">{p.name}</h3>{getStatusBadge(p.status)}</div>
              <p className="text-xs text-gray-500">{p.location}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-2/3 bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden">
        {selectedProject ? (
          <>
            {/* Header */}
            <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
              <div><h2 className="font-bold text-xl">{selectedProject.name}</h2><p className="text-sm text-gray-500">Status: {selectedProject.status}</p></div>
              <div className="flex gap-2">
                {user.role === 'vendor' && selectedProject.status === 'BRIEF' && <button onClick={handleSendProposal} className="bg-orange-600 text-white px-3 py-1 rounded text-sm font-bold">🚀 Ambil Proyek</button>}
                {user.role === 'vendor' && selectedProject.status === 'NEGOTIATING' && <button onClick={handleGenerateMoU} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm font-bold">📄 Buat MoU</button>}
                {user.role === 'client' && selectedProject.status === 'MOU_DRAFT' && <button onClick={() => navigate(`/sign-mou/${selectedProject.id}`)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">🔍 Review MoU</button>}
                {selectedProject.status === 'READY_TO_SIGN' && <button onClick={() => navigate(`/sign-mou/${selectedProject.id}`)} className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">✍️ Tanda Tangan</button>}
              </div>
            </div>

            {/* TAB SWITCHER */}
            <div className="flex border-b">
                <button 
                    onClick={() => setActiveTab('detail')}
                    className={`flex-1 py-3 text-sm font-bold text-center transition-colors ${activeTab === 'detail' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    📋 Detail Proyek
                </button>
                <button 
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-3 text-sm font-bold text-center transition-colors ${activeTab === 'chat' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    💬 Ruang Diskusi
                </button>
            </div>
            
            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
                {activeTab === 'detail' ? (
                    <div className="p-6">
                        <div className="bg-white border p-4 rounded-lg mb-4">
                            <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Deskripsi</h3>
                            <p className="text-gray-800 whitespace-pre-wrap">{selectedProject.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border p-4 rounded-lg">
                                <span className="text-gray-500 text-xs font-bold uppercase">Budget</span>
                                <p className="font-semibold">Rp {selectedProject.budget_limit?.toLocaleString()}</p>
                            </div>
                            <div className="bg-white border p-4 rounded-lg">
                                <span className="text-gray-500 text-xs font-bold uppercase">Lokasi</span>
                                <p className="font-semibold">{selectedProject.location}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    // TAMPILAN CHAT
                    <div className="flex flex-col h-full">
                        <div className="flex-1 p-4 overflow-y-auto space-y-2">
                            {messages.length === 0 && <p className="text-center text-gray-400 text-sm mt-10">Belum ada pesan. Mulai diskusi sekarang.</p>}
                            {messages.map((msg) => (
                                <ChatBubble key={msg.id} message={msg} isMe={msg.sender_username === user.username} />
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t flex gap-2">
                            <input 
                                type="text" 
                                className="flex-1 border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                placeholder="Tulis pesan..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700">
                                Kirim
                            </button>
                        </form>
                    </div>
                )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Pilih proyek di menu kiri.</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;