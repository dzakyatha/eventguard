import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; // <-- Import axios langsung (bukan client)
import client from '../api/client'; // Tetap import client untuk fungsi lain selain login
import { ENDPOINTS } from '../api/endpoints';

const AuthContext = createContext(null);

// Definisikan URL Backend manual disini agar 100% aman untuk Login
const API_BASE_URL = 'https://eventguard-production.up.railway.app';

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
            // Set header default untuk client.js agar fitur lain jalan
            client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (e) {
            localStorage.clear();
        }
      } 
      setLoading(false);
    };
    initAuth();
  }, []);

  // 2. Fungsi Login (BYPASS CLIENT.JS)
  const login = async (username, password) => {
    // Gunakan URLSearchParams standar
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    console.log("Mencoba Login Direct Axios...");

    // --- REQUEST MURNI TANPA INTERCEPTOR ---
    // Kita gabungkan Base URL + Endpoint Login secara manual
    // Pastikan ENDPOINTS.AUTH.LOGIN di file endpoints.js isinya '/auth/token' (atau sesuai route backend)
    const loginUrl = `${API_BASE_URL}${ENDPOINTS.AUTH.LOGIN}`; 

    const res = await axios.post(loginUrl, params, {
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded' 
        }
    });

    console.log("LOGIN SUCCESS:", res.data); 

    const { access_token, role, username: resUsername, user_id } = res.data;

    if (access_token) {
        localStorage.setItem('token', access_token);
        
        const userData = {
            id: user_id,
            username: resUsername,
            role: role
        };
        
        setUser(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        // PENTING: Beritahu 'client.js' bahwa kita sudah punya token untuk request selanjutnya
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