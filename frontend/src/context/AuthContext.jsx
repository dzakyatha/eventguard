import { createContext, useState, useContext, useEffect } from 'react';
import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user_data');
        return saved ? JSON.parse(saved) : null;
    });
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(false);

    const login = async (username, password) => {
        // 1. Kirim Login (Biarkan format request sesuai yang berhasil sebelumnya)
        // Asumsi: Backend menerima JSON { username, password }
        const res = await client.post(ENDPOINTS.AUTH.LOGIN, { username, password });

        // --- PERBAIKAN PENTING DI SINI ---
        console.log("Respon Backend:", res.data); // Cek di Console: isinya 'token' atau 'access_token'?

        // FastAPI defaultnya pakai 'access_token'. Kita ambil salah satu yang ada.
        const token = res.data.access_token || res.data.token;

        if (token) {
            // Simpan ke penyimpanan browser agar client.js bisa baca
            localStorage.setItem('token', token);
            
            // Ambil data user
            try {
                const userRes = await client.get(ENDPOINTS.AUTH.ME);
                setUser(userRes.data);
            } catch (e) {
                setUser({ username, role: 'client' }); // Fallback
            }
        } else {
            throw new Error("Token tidak ditemukan di respon login!");
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_data');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);