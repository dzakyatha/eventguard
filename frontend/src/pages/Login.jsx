// src/pages/Login.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
        await login(username, password);
        navigate('/dashboard');
        } catch (err) {
        setError('Login gagal. Cek username/password (Backend mungkin belum nyala).');
        }
    };

    return (
        <div className="flex justify-center items-center h-[80vh]">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Login EventGuard</h2>
            
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input 
                type="text" 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: rina_pelanggan"
                required 
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input 
                type="password" 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required 
                />
            </div>

            <button 
                type="submit" 
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
                Masuk
            </button>
            </form>
            <p className="mt-4 text-xs text-center text-gray-500">
            Gunakan user demo jika backend belum siap.
            </p>
        </div>
        </div>
    );
};

export default Login;