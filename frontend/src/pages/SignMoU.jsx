import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const SignMoU = () => {
    const { projectId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [project, setProject] = useState(null);
    const [mouId, setMouId] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // State Form Tanda Tangan
    const [signedName, setSignedName] = useState('');
    const [isAgreed, setIsAgreed] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Ambil Detail Proyek
                const resProject = await client.get(ENDPOINTS.PROJECTS.DETAIL(projectId));
                setProject(resProject.data);
                
                // 2. Ambil ID MoU
                try {
                    const resMoU = await client.get(ENDPOINTS.MOU.GET_BY_PROJECT(projectId));
                    setMouId(resMoU.data.id);
                } catch (err) {
                    console.log("MoU belum ada", err);
                }
            } catch (error) {
                console.error("Gagal load data:", error);
                alert("Gagal memuat data proyek.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [projectId]);

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

    // --- FITUR DOWNLOAD PDF ---
    const handleDownloadPDF = () => {
        setIsDownloading(true);
        const element = document.getElementById('mou-document'); // Ambil elemen dokumen
        const opt = {
            margin:       [10, 10, 10, 10], // Margin atas, kiri, bawah, kanan (mm)
            filename:     `MOU-EventGuard-${project.id}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 }, // Scale 2 agar teks tajam
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Generate PDF
        html2pdf().set(opt).from(element).save().then(() => {
            setIsDownloading(false);
        });
    };

    // --- HELPER FORMATTING (Untuk mengisi kolom kosong) ---
    const formatRupiah = (num) => "Rp " + (num || 0).toLocaleString('id-ID');
    const formatDateIndo = (dateString) => {
        if(!dateString) return "....................";
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };
    const getTodayDate = () => formatDateIndo(new Date());

    if (loading) return <div className="p-10 text-center">Memuat dokumen...</div>;
    if (!project) return <div className="p-10 text-center">Proyek tidak ditemukan.</div>;

    const isClient = user.role === 'client';
    const status = project.status;

    return (
        <div className="max-w-5xl mx-auto mt-6 mb-10">
            <button 
                onClick={() => navigate('/dashboard')} 
                className="mb-4 flex items-center text-gray-500 hover:text-indigo-600 transition-colors font-medium ml-1"
            >
                ← Kembali ke Dashboard
            </button>

            <div className="bg-white shadow-xl rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-3">
                
                {/* === KOLOM KIRI: DOKUMEN MOU === */}
                <div className="lg:col-span-2 border-r p-10 bg-white h-[85vh] overflow-y-auto font-serif text-sm text-gray-800 leading-relaxed">
                    
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
                                <tr><td className="w-32 align-top">Nama</td><td className="align-top">: {project.client_id ? `User ID ${project.client_id}` : "__________________________"}</td></tr>
                                <tr><td className="align-top">Alamat</td><td className="align-top">: __________________________ <span className="text-xs text-gray-400 italic">(Sesuai KTP)</span></td></tr>
                                <tr><td className="align-top">No. Identitas</td><td className="align-top">: __________________________</td></tr>
                            </tbody>
                        </table>
                        <p className="mt-1">(Selanjutnya disebut sebagai <strong>"PIHAK PERTAMA"</strong>)</p>
                    </div>

                    {/* PIHAK KEDUA */}
                    <div className="mb-6 pl-4">
                        <h3 className="font-bold uppercase mb-2">Pihak Kedua (Vendor/Event Organizer)</h3>
                        <table className="w-full text-left">
                            <tbody>
                                <tr><td className="w-32 align-top">Nama/Perusahaan</td><td className="align-top">: {project.vendor_id ? `Vendor ID ${project.vendor_id}` : "__________________________"}</td></tr>
                                <tr><td className="align-top">Alamat</td><td className="align-top">: __________________________</td></tr>
                                <tr><td className="align-top">No. Identitas/NIB</td><td className="align-top">: __________________________</td></tr>
                            </tbody>
                        </table>
                        <p className="mt-1">(Selanjutnya disebut sebagai <strong>"PIHAK KEDUA"</strong>)</p>
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

                {/* === KOLOM KANAN: PANEL AKSI (TETAP SAMA SEPERTI SEBELUMNYA) === */}
                <div className="lg:col-span-1 bg-gray-50 p-6 border-l border-gray-200 flex flex-col gap-6">
                    
                    {/* Status Badge */}
                    <div className={`p-4 rounded-lg border-2 ${status === 'ACTIVE' ? 'bg-green-100 border-green-400' : 'bg-white border-indigo-100'}`}>
                        <h3 className="font-bold mb-1 text-gray-700 uppercase text-xs tracking-wider">Status Dokumen</h3>
                        <span className={`font-bold text-lg ${status === 'ACTIVE' ? 'text-green-700' : 'text-indigo-600'}`}>{status.replace('_', ' ')}</span>
                    </div>

                    {/* --- MENU CLIENT REVIEW (MOU_DRAFT) --- */}
                    {status === 'MOU_DRAFT' && isClient && (
                        <div className="bg-white border p-6 rounded-lg shadow-sm">
                            <h3 className="font-bold mb-4 text-gray-800 border-b pb-2">Verifikasi Dokumen</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Mohon baca draf di samping dengan teliti. Pastikan Budget, Tanggal, dan Lingkup Kerja sudah sesuai.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button onClick={handleRevise} className="w-full border-2 border-red-200 text-red-600 py-2 rounded-lg text-sm hover:bg-red-50 font-bold transition-colors">
                                    Minta Revisi
                                </button>
                                <button onClick={handleApprove} className="w-full bg-indigo-600 text-white py-3 rounded-lg text-sm hover:bg-indigo-700 font-bold shadow-md transition-colors">
                                    ✅ Setujui Dokumen
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- MENU TANDA TANGAN (READY_TO_SIGN) --- */}
                    {status === 'READY_TO_SIGN' && (
                        <div className="bg-white border p-6 rounded-lg shadow-sm">
                            <h3 className="font-bold mb-4 text-gray-800 border-b pb-2">Tanda Tangan Digital</h3>
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nama Lengkap (Sesuai KTP)</label>
                                <input 
                                    type="text" 
                                    className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={signedName}
                                    onChange={(e) => setSignedName(e.target.value)}
                                    placeholder="Contoh: Budi Santoso"
                                />
                            </div>
                            <label className="flex items-start gap-3 text-sm mb-6 cursor-pointer p-3 bg-gray-50 rounded border border-gray-100 hover:bg-gray-100">
                                <input type="checkbox" className="mt-1 w-4 h-4 text-indigo-600 rounded" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} />
                                <span className="text-gray-600 text-xs leading-relaxed">Saya menyatakan telah membaca, memahami, dan menyetujui seluruh isi perjanjian ini secara sadar dan tanpa paksaan.</span>
                            </label>
                            <button 
                                onClick={handleSign}
                                disabled={!isAgreed || !signedName}
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md transition-colors flex justify-center items-center gap-2"
                            >
                                ✍️ Tanda Tangan Sekarang
                            </button>
                        </div>
                    )}

                    {/* --- SUDAH SELESAI --- */}
                    {status === 'ACTIVE' && (
                        <div className="bg-green-50 p-8 rounded-lg border border-green-200 text-center shadow-inner">
                            <div className="text-5xl mb-4">🤝</div>
                            <h3 className="font-bold text-green-800 text-xl">Sah & Aktif</h3>
                            <p className="text-sm text-green-700 mt-2">Dokumen telah ditandatangani oleh kedua belah pihak secara digital.</p>
                            
                            {/* TOMBOL DOWNLOAD BARU */}
                            <button 
                                onClick={handleDownloadPDF} 
                                disabled={isDownloading}
                                className="mt-6 w-full bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-gray-900 shadow-lg flex justify-center items-center gap-2 transition-all active:scale-95"
                            >
                                {isDownloading ? 'Sedang Memproses...' : '📥 Download PDF'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SignMoU;