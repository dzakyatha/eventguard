import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import html2pdf from 'html2pdf.js';

// --- IKON SVG ---
const Icons = {
  Back: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  CheckCircle: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Pencil: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  Download: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  DocumentCheck: () => <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Alert: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
};

// Komponen Input Field
const EditableField = ({ value, onChange, placeholder, disabled }) => (
    <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="border-b border-[#251E3B] outline-none bg-transparent w-full md:w-64 px-1 text-[#251E3B] font-serif font-bold placeholder-gray-300 focus:border-[#FF9206] disabled:text-black disabled:border-none disabled:bg-transparent transition-colors"
    />
);

const SignMoU = () => {
    const { projectId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [project, setProject] = useState(null);
    const [mouId, setMouId] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [clientInfo, setClientInfo] = useState(() => {
        const saved = localStorage.getItem(`mou_client_${projectId}`);
        return saved ? JSON.parse(saved) : { nama: '', alamat: '', id_no: '' };
    });

    const [vendorInfo, setVendorInfo] = useState(() => {
        const saved = localStorage.getItem(`mou_vendor_${projectId}`);
        return saved ? JSON.parse(saved) : { nama: '', alamat: '', id_no: '' };
    });

    const [signedName, setSignedName] = useState('');
    const [isAgreed, setIsAgreed] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if(clientInfo.nama) localStorage.setItem(`mou_client_${projectId}`, JSON.stringify(clientInfo));
    }, [clientInfo, projectId]);

    useEffect(() => {
        if(vendorInfo.nama) localStorage.setItem(`mou_vendor_${projectId}`, JSON.stringify(vendorInfo));
    }, [vendorInfo, projectId]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resProject = await client.get(ENDPOINTS.PROJECTS.DETAIL(projectId));
                setProject(resProject.data);
                
                if (user.role === 'client' && !clientInfo.nama) setClientInfo(prev => ({ ...prev, nama: user.username }));
                if (user.role === 'vendor' && !vendorInfo.nama) setVendorInfo(prev => ({ ...prev, nama: user.username }));

                try {
                    const resMoU = await client.get(ENDPOINTS.MOU.GET_BY_PROJECT(projectId));
                    setMouId(resMoU.data.id);
                } catch (err) { console.log("MoU belum ada", err); }
            } catch (error) {
                console.error("Gagal load data:", error);
            } finally { setLoading(false); }
        };
        fetchData();
    }, [projectId, user]);

    const handleApprove = async () => {
        if (!mouId) return alert("Error: ID MoU tidak ditemukan.");
        if(!confirm("Yakin setujui dokumen?")) return;
        try {
            await client.patch(ENDPOINTS.MOU.UPDATE_STATUS(mouId), { action: "APPROVE", feedback: "Approved by Client" });
            alert("MoU Disetujui!");
            window.location.reload(); 
        } catch (error) { alert("Gagal approve."); }
    };

    const handleRevise = async () => {
        if (!mouId) return alert("Error: ID MoU tidak ditemukan.");
        const alasan = prompt("Masukkan catatan revisi:");
        if (!alasan) return;
        try {
            await client.patch(ENDPOINTS.MOU.UPDATE_STATUS(mouId), { action: "REVISE", feedback: alasan });
            alert("Revisi dikirim.");
            navigate('/dashboard');
        } catch (error) { alert("Gagal kirim revisi."); }
    };

    const handleSign = async () => {
        if (!mouId) return;
        try {
            await client.post(ENDPOINTS.MOU.SIGN(mouId));
            alert("Berhasil ditandatangani!");
            navigate('/dashboard');
        } catch (error) { alert("Gagal tanda tangan."); }
    };

    // --- FIX FITUR DOWNLOAD PDF (V8 - Overlay Fullscreen) ---
    const handleDownloadPDF = async () => {
        const originalElement = document.getElementById('mou-document');
        if (!originalElement) return alert("Gagal menemukan dokumen.");

        setIsDownloading(true);

        const clone = originalElement.cloneNode(true);
        const container = document.createElement('div');
        Object.assign(container.style, {
            position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
            zIndex: '99999', backgroundColor: 'white', overflowY: 'scroll', padding: '20px', boxSizing: 'border-box'
        });

        clone.className = ''; // Reset class
        Object.assign(clone.style, {
            height: 'auto', maxHeight: 'none', overflow: 'visible', width: '210mm', margin: '0 auto',
            backgroundColor: 'white', color: 'black', fontFamily: 'Times New Roman, serif', fontSize: '12pt', lineHeight: '1.5'
        });

        // Mapping Input to Text
        const originalInputs = originalElement.querySelectorAll('input');
        const clonedInputs = clone.querySelectorAll('input');
        originalInputs.forEach((input, index) => {
            const span = document.createElement('span');
            span.innerText = input.value ? input.value : '__________________________';
            Object.assign(span.style, { fontWeight: 'bold', borderBottom: '1px solid black', display: 'inline-block', minWidth: '200px', color: 'black' });
            if (clonedInputs[index]) clonedInputs[index].parentNode.replaceChild(span, clonedInputs[index]);
        });

        container.appendChild(clone);
        document.body.appendChild(container);
        await new Promise(resolve => setTimeout(resolve, 800));

        const opt = {
            margin: 15, filename: `MOU-EventGuard-${project.id}.pdf`, image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, windowWidth: container.scrollWidth },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try { await html2pdf().set(opt).from(clone).save(); } 
        catch (error) { console.error("Error PDF", error); alert("Gagal download PDF"); } 
        finally { document.body.removeChild(container); setIsDownloading(false); }
    };

    const formatRupiah = (num) => "Rp " + (num || 0).toLocaleString('id-ID');
    const formatDateIndo = (dateString) => {
        if(!dateString) return "....................";
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };
    const getTodayDate = () => formatDateIndo(new Date());

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-[#251E3B]">Memuat dokumen...</div>;
    if (!project) return <div className="p-10 text-center">Proyek tidak ditemukan.</div>;

    const isClient = user.role === 'client';
    const isVendor = user.role === 'vendor';
    const status = project.status;
    const canEditClient = isClient && status === 'MOU_DRAFT';
    const canEditVendor = isVendor && (status === 'NEGOTIATING' || status === 'MOU_DRAFT' || status === 'MOU_REVISION');

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-10 font-sans text-[#251E3B]">
            <div className="max-w-6xl mx-auto px-4">
                
                {/* Header Navigasi */}
                <button onClick={() => navigate('/dashboard')} className="mb-6 text-sm text-[#251E3B]/60 hover:text-[#FF9206] flex items-center gap-2 font-bold transition-colors">
                    <Icons.Back /> Kembali ke Dashboard
                </button>

                <div className="flex flex-col lg:flex-row gap-8">
                    
                {/* === KOLOM KIRI: DOKUMEN MOU === */}
                <div id="mou-document" className="lg:col-span-2 border-r p-10 bg-white h-[85vh] overflow-y-auto font-serif text-sm text-gray-800 leading-relaxed">
                    
                    {/* JUDUL */}
                    <div className="text-center mb-8">
                        <h1 className="font-bold text-lg uppercase tracking-wide border-b-2 border-black inline-block pb-1">Surat Perjanjian Kerjasama</h1>
                        <p className="font-bold mt-1">( Memorandum of Understanding / MoU )</p>
                        <p className="mt-2 text-gray-600">Kerjasama Pelaksanaan Jasa Event melalui Platform EventGuard</p>
                        <p className="text-xs text-gray-400 mt-2">Nomor Dokumen: EVG/{new Date().getFullYear()}/{project.id}/{mouId || 'DRAFT'}</p>
                    </div>

                    {/* PEMBUKAAN */}
                    <p className="text-justify mb-4">
                        Pada hari ini <strong>{getTodayDate()}</strong>, bertempat di <strong>{project.location || "Indonesia"}</strong>, telah dibuat dan disepakati Surat Perjanjian Kerjasama antara:
                    </p>

                    {/* PIHAK PERTAMA */}
                    <div className="mb-4 pl-4">
                        <h3 className="font-bold uppercase mb-2">Pihak Pertama (Pelanggan)</h3>
                        <table className="w-full text-left">
                            <tbody>
                                <tr>
                                    <td className="w-32 align-top">Nama</td>
                                    <td className="align-top">: <EditableField value={clientInfo.nama} onChange={(val)=>setClientInfo({...clientInfo, nama: val})} placeholder="Nama Lengkap" disabled={!canEditClient} /></td>
                                </tr>
                                <tr>
                                    <td className="align-top">Alamat</td>
                                    <td className="align-top">: <EditableField value={clientInfo.alamat} onChange={(val)=>setClientInfo({...clientInfo, alamat: val})} placeholder="Alamat Sesuai KTP" disabled={!canEditClient} /></td>
                                </tr>
                                <tr>
                                    <td className="align-top">No. Identitas</td>
                                    <td className="align-top">: <EditableField value={clientInfo.id_no} onChange={(val)=>setClientInfo({...clientInfo, id_no: val})} placeholder="No. KTP / SIM" disabled={!canEditClient} /></td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="mt-1">Selanjutnya disebut sebagai <strong>"PIHAK PERTAMA"</strong></p>
                    </div>

                    {/* PIHAK KEDUA */}
                    <div className="mb-6 pl-4">
                        <h3 className="font-bold uppercase mb-2">Pihak Kedua (Vendor/Event Organizer)</h3>
                        <table className="w-full text-left">
                            <tbody>
                                <tr>
                                    <td className="w-32 align-top">Nama/Perusahaan</td>
                                    <td className="align-top">: <EditableField value={vendorInfo.nama} onChange={(val)=>setVendorInfo({...vendorInfo, nama: val})} placeholder="Nama Vendor" disabled={!canEditVendor} /></td>
                                </tr>
                                <tr>
                                    <td className="align-top">Alamat</td>
                                    <td className="align-top">: <EditableField value={vendorInfo.alamat} onChange={(val)=>setVendorInfo({...vendorInfo, alamat: val})} placeholder="Alamat Operasional" disabled={!canEditVendor} /></td>
                                </tr>
                                <tr>
                                    <td className="align-top">No. Identitas/NIB</td>
                                    <td className="align-top">: <EditableField value={vendorInfo.id_no} onChange={(val)=>setVendorInfo({...vendorInfo, id_no: val})} placeholder="No. NIB / NPWP" disabled={!canEditVendor} /></td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="mt-1">Selanjutnya disebut sebagai <strong>"PIHAK KEDUA"</strong></p>
                    </div>

                    <p className="text-justify mb-4">
                        Kedua pihak dengan ini sepakat untuk bekerjasama dalam pelaksanaan jasa event melalui platform EventGuard dengan ketentuan sebagai berikut:
                    </p>

                    {/* PASAL-PASAL */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold text-center mb-2">PASAL 1 — TUJUAN KERJASAMA</h3>
                            <p className="text-justify">
                                Perjanjian ini dibuat untuk menjalin kerja sama penyediaan jasa event oleh PIHAK KEDUA kepada PIHAK PERTAMA, dengan ketentuan dan fasilitas transaksi melalui sistem escrow, monitoring proyek, dan verifikasi digital pada platform EventGuard.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-center mb-2">PASAL 2 — RUANG LINGKUP & PELAKSANAAN</h3>
                            <p className="mb-2">PIHAK KEDUA memberikan layanan event sesuai kebutuhan PIHAK PERTAMA (Proyek: <strong>{project.name}</strong>), yang meliputi:</p>
                            <div className="bg-gray-50 p-3 border border-gray-200 rounded mb-2 italic whitespace-pre-wrap">
                                {project.description}
                            </div>
                            <ul className="list-disc pl-5 text-justify">
                                <li>Seluruh komunikasi, revisi, dan bukti progres pekerjaan wajib dilakukan melalui platform EventGuard.</li>
                                <li>PIHAK KEDUA wajib menyelesaikan pekerjaan sesuai tenggat waktu (<strong>{formatDateIndo(project.event_date)}</strong>) dan standar layanan yang telah disetujui.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-center mb-2">PASAL 3 — PEMBAYARAN & PEMBAGIAN KEUNTUNGAN</h3>
                            <p className="mb-2">Nilai pekerjaan disepakati sebesar: <strong>{formatRupiah(project.budget_limit)}</strong>.</p>
                            <p className="mb-2">Sistem pembayaran menggunakan mekanisme escrow EventGuard dengan pembagian sebagai berikut:</p>
                            
                            <table className="w-full border-collapse border border-black text-xs mb-2">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="border border-black p-1">Termin</th>
                                        <th className="border border-black p-1">Persentase</th>
                                        <th className="border border-black p-1">Waktu Pembayaran</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-black p-1 text-center">Termin 1 (DP)</td>
                                        <td className="border border-black p-1 text-center">50%</td>
                                        <td className="border border-black p-1">Setelah MoU ditandatangani</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-1 text-center">Termin 2</td>
                                        <td className="border border-black p-1 text-center">20%</td>
                                        <td className="border border-black p-1">Setelah progres tahap kedua disetujui</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-1 text-center">Termin 3 (Pelunasan)</td>
                                        <td className="border border-black p-1 text-center">30%</td>
                                        <td className="border border-black p-1">Setelah pekerjaan selesai dan disetujui</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p className="text-justify">
                                Platform EventGuard berhak memperoleh biaya layanan sebesar <strong>5%</strong> dari total nilai proyek yang akan dipotong otomatis saat pencairan dana kepada PIHAK KEDUA. Sisa pembayaran setelah potongan platform merupakan hak penuh PIHAK KEDUA.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-center mb-2">PASAL 4 — TANGGUNG JAWAB, REVISI & SENGKETA</h3>
                            <ul className="list-decimal pl-5 text-justify space-y-1">
                                <li>PIHAK PERTAMA berhak meminta maksimal <strong>3 (tiga)</strong> kali revisi minor tanpa biaya tambahan.</li>
                                <li>Jika terjadi keterlambatan atau hasil tidak sesuai, PIHAK KEDUA wajib memperbaiki tanpa biaya tambahan.</li>
                                <li>Bila terjadi perselisihan, penyelesaian dilakukan melalui tahapan berikut:
                                    <ul className="list-[lower-alpha] pl-5 mt-1">
                                        <li>Negosiasi melalui platform EventGuard</li>
                                        <li>Mediasi oleh Admin EventGuard</li>
                                        <li>Jika masih tidak tercapai kesepakatan, maka diselesaikan sesuai hukum Republik Indonesia.</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-center mb-2">PASAL 5 — MASA BERLAKU & PENUTUP</h3>
                            <p className="text-justify">
                                Perjanjian ini berlaku sejak ditandatangani hingga seluruh kewajiban pekerjaan dinyatakan selesai di platform EventGuard. Perjanjian dapat diperbarui atau diubah berdasarkan kesepakatan tertulis kedua pihak.
                            </p>
                        </div>
                    </div>

                    {/* PENUTUP & TANDA TANGAN */}
                    <div className="mt-8">
                        <p className="text-justify mb-8">
                            Dengan demikian, surat perjanjian ini dibuat dengan penuh kesadaran, tanpa paksaan dari pihak manapun, dan masing-masing pihak menyatakan sanggup mematuhi seluruh isi perjanjian ini. Dokumen ini mempunyai kekuatan hukum yang sama dan menjadi dasar sah pelaksanaan kerjasama.
                        </p>

                        <div className="flex justify-between text-center mt-10">
                            <div className="w-1/3">
                                <p className="font-bold mb-16">PIHAK PERTAMA</p>
                                <div className="border-b border-black mb-1">
                                    {project.client_signed_at ? <span className="text-green-600 font-bold font-mono">[ TERTANDA TANGAN DIGITAL ]</span> : "(Belum Tanda Tangan)"}
                                </div>
                                <p>( Pelanggan )</p>
                            </div>
                            <div className="w-1/3">
                                <p className="font-bold mb-16">PIHAK KEDUA</p>
                                <div className="border-b border-black mb-1">
                                    {project.vendor_signed_at ? <span className="text-green-600 font-bold font-mono">[ TERTANDA TANGAN DIGITAL ]</span> : "(Belum Tanda Tangan)"}
                                </div>
                                <p>( Vendor )</p>
                            </div>
                        </div>
                        <div className="text-center mt-8 text-xs text-gray-400">
                            Dokumen ini di-generate secara otomatis oleh Sistem EventGuard pada {new Date().toLocaleString()}
                        </div>
                    </div>
                </div>

                    {/* === KOLOM KANAN: PANEL AKSI === */}
                    <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
                        
                        {/* Status Card */}
                        <div className={`p-6 rounded-3xl border-2 flex flex-col items-center text-center ${status === 'ACTIVE' ? 'bg-green-50 border-green-200' : 'bg-white border-[#251E3B]/10'}`}>
                            <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-50">Status Dokumen</p>
                            <span className={`text-xl font-extrabold ${status === 'ACTIVE' ? 'text-green-600' : 'text-[#251E3B]'}`}>{status.replace('_', ' ')}</span>
                        </div>

                        {/* Actions: Client Review */}
                        {status === 'MOU_DRAFT' && isClient && (
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#251E3B]/5">
                                <h3 className="font-bold text-[#251E3B] mb-2 flex items-center gap-2"><Icons.Pencil /> Verifikasi</h3>
                                <p className="text-xs text-gray-500 mb-4 bg-yellow-50 p-3 rounded-xl border border-yellow-100 flex gap-2">
                                    <Icons.Alert /> Lengkapi data di dokumen sebelum setuju.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button onClick={handleRevise} className="w-full py-3 rounded-xl border border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors">Minta Revisi</button>
                                    <button onClick={handleApprove} className="w-full py-3 rounded-xl bg-[#251E3B] text-white font-bold text-sm hover:bg-slate-900 shadow-lg shadow-slate-500/20 transition-colors">✅ Setujui</button>
                                </div>
                            </div>
                        )}

                        {/* Actions: Signing */}
                        {status === 'READY_TO_SIGN' && (
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#251E3B]/5">
                                <h3 className="font-bold text-[#251E3B] mb-4 flex items-center gap-2"><Icons.Pencil /> Tanda Tangan</h3>
                                <input type="text" className="w-full border border-gray-200 bg-[#F8FAFC] p-3 rounded-xl text-sm mb-4 outline-none focus:ring-2 focus:ring-[#FF9206]" value={signedName} onChange={(e) => setSignedName(e.target.value)} placeholder="Ketik Nama Lengkap" />
                                <label className="flex items-start gap-3 text-xs mb-6 cursor-pointer p-3 bg-[#F8FAFC] rounded-xl text-gray-500">
                                    <input type="checkbox" className="mt-0.5" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} />
                                    <span>Saya menyetujui isi perjanjian ini secara hukum.</span>
                                </label>
                                <button onClick={handleSign} disabled={!isAgreed || !signedName} className="w-full py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-500/20 disabled:bg-gray-300 transition-colors">✍️ Tanda Tangan</button>
                            </div>
                        )}

                        {/* Actions: Download */}
                        {status === 'ACTIVE' && (
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-green-100 text-center">
                                <div className="flex justify-center mb-4"><Icons.DocumentCheck /></div>
                                <h3 className="font-bold text-[#251E3B] text-lg">Dokumen Sah</h3>
                                <p className="text-xs text-gray-400 mt-1 mb-6">Tersimpan aman di blockchain.</p>
                                <button onClick={handleDownloadPDF} disabled={isDownloading} className="w-full py-3 rounded-xl bg-[#251E3B] text-white font-bold text-sm hover:bg-slate-900 shadow-lg flex justify-center items-center gap-2 transition-transform active:scale-95">
                                    {isDownloading ? 'Memproses...' : <><Icons.Download /> Download PDF</>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignMoU;