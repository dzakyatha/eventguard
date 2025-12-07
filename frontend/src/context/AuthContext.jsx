import { createContext, useState, useContext, useEffect } from 'react';
import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Cek Login saat Aplikasi Dibuka
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user_data');

      if (token && savedUser) {
        try {
            setUser(JSON.parse(savedUser));
            // Set header default agar request selanjutnya valid
            client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (e) {
            console.error("Gagal parse user data", e);
            localStorage.clear();
        }
      } 
      setLoading(false);
    };
    initAuth();
  }, []);

  // 2. Fungsi Login
  const login = async (username, password) => {
    // Format x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    console.log("Mengirim request login ke backend..."); // Debug

    const res = await client.post(ENDPOINTS.AUTH.LOGIN, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log("Respon Backend Diterima:", res.data); // Debug: Pastikan data masuk

    // Ambil data langsung dari respon (sesuai log Anda tadi)
    const { access_token, role, username: resUsername, user_id } = res.data;

    if (access_token) {
        // A. Simpan Token
        localStorage.setItem('token', access_token);
        
        // B. Set Header Authorization Global
        client.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

        // C. Siapkan Data User
        const userData = {
            id: user_id,          // Backend kirim 'user_id', kita simpan sbg 'id'
            username: resUsername,
            role: role
        };

        // D. Simpan State & Storage
        setUser(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        return true;
    } else {
        throw new Error("Token tidak ditemukan dalam respon backend.");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    setUser(null);
    delete client.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);