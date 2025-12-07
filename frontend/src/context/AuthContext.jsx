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
    // 1. Siapkan data sebagai URLSearchParams (Format Form Data)
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    // 2. Kirim Request
    // PENTING: Kita hapus 'Authorization' header agar token lama tidak mengganggu
    // PENTING: Kita timpa 'Content-Type' jadi undefined agar axios mendeteksi otomatis dari params
    const res = await client.post(ENDPOINTS.AUTH.LOGIN, params, {
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': '' // Kosongkan header auth
        }
    });

    // 3. Proses Respon
    const { access_token, role, username: resUsername, user_id } = res.data;

    if (access_token) {
        localStorage.setItem('token', access_token);
        
        // Simpan data user
        const userData = {
            id: user_id,
            username: resUsername,
            role: role
        };
        setUser(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        // Set header untuk request berikutnya
        client.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        return true;
    } else {
        throw new Error("Token tidak ditemukan.");
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