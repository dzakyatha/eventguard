import axios from 'axios';

const client = axios.create({
    baseURL: 'https://eventguard-production.up.railway.app',
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use((config) => {
    // Ambil token yang tadi disimpan di AuthContext
    const token = localStorage.getItem('token');
    
    if (token) {
        // Tempelkan ke Header 'Authorization'
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default client;