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
        setLoading(true);
        try {
        const payload = { username, password };
        
        const response = await client.post(ENDPOINTS.AUTH.LOGIN, payload);
        
        const { access_token, role, user_id, username: resUsername } = response.data;
        
        const userData = { username: resUsername, role, id: user_id };

        localStorage.setItem('token', access_token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        setToken(access_token);
        setUser(userData);
        return true;
        } catch (error) {
        console.error("Login error:", error);
        throw error;
        } finally {
        setLoading(false);
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