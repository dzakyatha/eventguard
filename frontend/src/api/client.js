import axios from 'axios';

const client = axios.create({
    baseURL: 'https://eventguard-production.up.railway.app',
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    
    // --- DEBUGGING (Lihat di Console Browser Teman) ---
    // console.log("Request ke:", config.url);
    // console.log("Token yang dikirim:", token ? "Ada" : "TIDAK ADA");
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Sesi habis atau token salah. Logout otomatis.");
            localStorage.removeItem('token');
            // Opsional: Redirect ke login page
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default client;