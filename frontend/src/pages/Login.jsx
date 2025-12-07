import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            console.log("Mencoba login dengan:", username); // Debug 1
            await login(username, password);
            console.log("Login sukses, redirecting..."); // Debug 2
            navigate('/dashboard');
        } catch (err) {
            // --- INI BAGIAN PENTING YANG SEBELUMNYA HILANG ---
            console.error("LOGIN ERROR FULL:", err);
            if (err.response) {
                console.error("Response Data:", err.response.data);
                console.error("Status Code:", err.response.status);
                // Tampilkan pesan error spesifik dari backend jika ada
                setError(err.response.data.detail || 'Login gagal. Cek username/password.');
            } else if (err.request) {
                console.error("No Response (Network Error):", err.request);
                setError('Gagal terhubung ke server. Cek koneksi internet.');
            } else {
                console.error("Error Setup:", err.message);
                setError(`Terjadi kesalahan: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        // Container Utama: Full Screen (h-screen), Flex Row
        <div className="flex w-full h-screen overflow-hidden font-sans">
            
            {/* === KOLOM KIRI: FORM (50% Width, White Background) === */}
            <div className="w-full md:w-1/2 bg-white flex flex-col justify-center p-10 md:p-16 lg:p-12 overflow-y-auto">
                
                <div className="w-full max-w-md mx-auto">
                    {/* Logo EventGuard */}
                    <div className="mb-10">
                        <img 
                            src="/images/logo_long.png" 
                            alt="EventGuard Logo" 
                            className="h-10 w-auto" 
                        />
                    </div>

                    <div className="mb-8">
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Welcome Back!</h2>
                        <p className="text-gray-500">Masuk untuk mengelola event dan vendor Anda dengan aman.</p>
                    </div>
                    
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border-l-4 border-red-500 flex items-center gap-3">
                            ⚠️ <span>{error}</span>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                            <input 
                                type="text" 
                                className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all font-medium text-gray-700 placeholder-gray-400"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Masukkan username"
                                required 
                            />
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-gray-700">Password</label>
                            </div>
                            <input 
                                type="password" 
                                className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all font-medium text-gray-700 placeholder-gray-400"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required 
                            />
                        </div>

                        {/* Tombol menggunakan warna ORANGE dari Logo */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
                        >
                            {loading ? 'Memproses...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-500">
                        Belum punya akun? <Link to="/register" className="text-orange-600 font-bold hover:underline">Daftar sekarang</Link>
                    </p>
                </div>
            </div>

            {/* === KOLOM KANAN: GAMBAR (50% Width, Fixed) === */}
            {/* Menggunakan Background Dark Navy (Sesuai Perisai Logo) */}
            <div className="hidden md:block w-1/2 relative bg-[#1E1E2E]"> 
                
                {/* Gambar Background dengan Blend Mode */}
                <img 
                    // Gambar background meeting/profesional
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop" 
                    alt="Login Visual" 
                    className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                />
                
                {/* Overlay Text */}
                <div className="absolute inset-0 flex flex-col justify-center p-16 lg:p-24 text-white z-10">
                    <div className="mb-6">
                        {/* Ikon Dekoratif */}
                        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        </div>
                        <h3 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                            Keamanan Transaksi <br/> <span className="text-orange-400">Event Terjamin.</span>
                        </h3>
                        <p className="text-gray-300 text-lg leading-relaxed max-w-lg">
                            Platform escrow terpercaya untuk kelancaran event Anda. Kelola vendor, pantau progress, dan pembayaran dalam satu pintu yang aman.
                        </p>
                    </div>
                    
                    {/* Testimonial Kecil (Opsional - Menambah kesan premium) */}
                    <div className="mt-12 flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 w-fit">
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-[#1E1E2E]"></div>
                            <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-[#1E1E2E]"></div>
                            <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-[#1E1E2E]"></div>
                        </div>
                        <p className="text-sm font-medium text-white">Dipercaya oleh 100+ Vendor</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Login;