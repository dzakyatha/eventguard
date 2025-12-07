import { createContext, useState, useContext, useEffect } from 'react';
import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Cek Login saat Aplikasi Dibuka (Auto Login)
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Cek apakah token masih valid ke backend
          const res = await client.get(ENDPOINTS.AUTH.ME); // Pastikan endpoint ini ada di backend
          setUser(res.data); 
        } catch (error) {
          console.error("Token expired/invalid", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // 2. Fungsi Login (PERBAIKAN UTAMA DISINI)
  const login = async (username, password) => {
    // FastAPI biasanya butuh format Form Data untuk login
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    // Panggil API Login
    const res = await client.post(ENDPOINTS.AUTH.LOGIN, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    // --- FIX PENTING: MENYIMPAN TOKEN ---
    // Backend FastAPI biasanya mengembalikan: { "access_token": "...", "token_type": "bearer" }
    const token = res.data.access_token || res.data.token; 
    
    if (!token) throw new Error("Token tidak ditemukan dalam respon backend");

    // Simpan ke LocalStorage agar client.js bisa membacanya
    localStorage.setItem('token', token);

    // Set User State (Jika backend mengirim data user saat login, gunakan itu. Jika tidak, ambil manual)
    // Disini kita asumsi endpoint login mengembalikan token saja, jadi kita decode atau ambil profile
    try {
        const userRes = await client.get(ENDPOINTS.AUTH.ME);
        setUser(userRes.data);
    } catch (e) {
        // Fallback jika endpoint ME error, set user manual dari input (darurat)
        setUser({ username, role: 'client' }); // Sesuaikan role default
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);