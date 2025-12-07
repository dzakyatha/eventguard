import { createContext, useState, useContext, useEffect } from 'react';
import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Cek Login saat Aplikasi Dibuka (Refresh Halaman)
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user_data'); // Ambil backup data user

      if (token && savedUser) {
        // Jika ada token & data user di storage, langsung set login
        setUser(JSON.parse(savedUser));
      } 
      
      setLoading(false);
    };
    initAuth();
  }, []);

  // 2. Fungsi Login (PERBAIKAN UTAMA: SESUAI RESPON BACKEND ANDA)
  const login = async (username, password) => {
    // Gunakan URLSearchParams untuk format x-www-form-urlencoded (Standar OAuth2 FastAPI)
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const res = await client.post(ENDPOINTS.AUTH.LOGIN, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log("LOGIN SUCCESS:", res.data); // Debugging

    // Ambil data sesuai respon console Anda tadi
    const { access_token, role, username: resUsername, user_id } = res.data;

    if (access_token) {
        // A. Simpan Token
        localStorage.setItem('token', access_token);
        
        // B. Siapkan Objek User
        const userData = {
            id: user_id,
            username: resUsername,
            role: role
        };

        // C. Simpan Data User (State & LocalStorage)
        setUser(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        // (Opsional) Set default header client agar request selanjutnya langsung pakai token ini
        client.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    } else {
        throw new Error("Login gagal: Token tidak ditemukan.");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    setUser(null);
    // Hapus header
    delete client.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);