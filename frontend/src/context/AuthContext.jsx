import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

// ─── Mock Seeder (Fallback jika API tidak tersedia) ───────────────────────────
const USER_SEEDER = [
    { username: 'superadmin', email: 'superadmin@clinic.com', password: 'password', name: 'Super Admin', role: 'Super Admin' },
    { username: 'doctor', email: 'doctor@clinic.com', password: 'password', name: 'Dr. Mega Endahlestari', role: 'Dokter' },
    { username: 'cs', email: 'cs@clinic.com', password: 'password', name: 'Mba Fia', role: 'Customer Service' },
    { username: 'hrd', email: 'hrd@clinic.com', password: 'password', name: 'Bu Yeyen', role: 'HRD' },
    { username: 'spv_treatment', email: 'spv.treatment@clinic.com', password: 'password', name: 'Andi Pratama', role: 'Supervisor Treatment' },
    { username: 'asisten_spv_treatment', email: 'asisten.spv.treatment@clinic.com', password: 'password', name: 'Andi Pratama', role: 'Asisten Supervisor Treatment' },
    { username: 'spv_produk', email: 'spv.produk@clinic.com', password: 'password', name: 'Budi Santoso', role: 'Supervisor Produk' },
    { username: 'gudang', email: 'gudang@clinic.com', password: 'password', name: 'Zulkifli', role: 'Gudang Umum' },
    { username: 'owner', email: 'owner@clinic.com', password: 'password', name: 'Nanin Lindiyawati', role: 'Owner' },
    { username: 'ob', email: 'ob@clinic.com', password: 'password', name: 'Staff OB', role: 'Staff OB' },
    { username: 'satpam', email: 'satpam@clinic.com', password: 'password', name: 'Staff Satpam', role: 'Staff Satpam' },
    { username: 'apoteker', email: 'apoteker@clinic.com', password: 'password', name: 'Apoteker', role: 'Apoteker' },
    // Akun backend (fallback offline)
    { username: 'admin', email: 'admin@pbics.com', password: 'password123', name: 'Admin Utama', role: 'Super Admin' },
];

// ─── Helper: mapping role dari divisi + jabatan backend ─────────────────────
// Response API: { jabatan: "Lead", divisi: "Manager" }
const mapToRole = (jabatan = '', divisi = '') => {
    const d = divisi.toLowerCase();
    const j = jabatan.toLowerCase();
    // Mapping berdasarkan divisi (lebih spesifik)
    if (d.includes('manager') || d.includes('super admin')) return 'Super Admin';
    if (d.includes('dokter'))                               return 'Dokter';
    if (d.includes('kasir') || d.includes('customer service')) return 'Customer Service';
    if (d.includes('hrd'))                                  return 'HRD';
    if (d.includes('supervisor treatment'))                 return 'Supervisor Treatment';
    if (d.includes('supervisor produk'))                    return 'Supervisor Produk';
    if (d.includes('gudang'))                               return 'Gudang Umum';
    if (d.includes('apoteker'))                             return 'Apoteker';
    if (d.includes('perawat'))                              return 'Dokter';
    if (d.includes('owner'))                                return 'Owner';
    // Fallback ke jabatan jika divisi tidak match
    if (j.includes('lead') || j.includes('manager'))       return 'Super Admin';
    return 'Customer Service';
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // ── Restore persisted session on mount ──────────────────────────────────
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    // ── Login: coba API dulu, fallback ke mock ───────────────────────────────
    const login = async (usernameOrEmail, password) => {
        // 1. Coba login ke backend API (kirim input apa adanya, api.js yang handle)
        const apiResult = await authAPI.login(usernameOrEmail, password);

        if (apiResult.success) {
            // ── Parse response: { message, access_token, token_type, data: {...} }
            const { access_token, data: apiUser } = apiResult.data;
            
            // Jika divisi tidak dikirim terpisah, ambil dari string jabatan (format: "POSISI - DIVISI")
            const fullJabatan = apiUser?.jabatan || '';
            const [extractedPosisi, ...divisiParts] = fullJabatan.split(' - ');
            const extractedDivisi = apiUser?.divisi || divisiParts.join(' - ') || extractedPosisi;

            const userData = {
                id:      apiUser?.id,
                name:    apiUser?.nama_lengkap || usernameOrEmail,
                email:   apiUser?.email || '',
                role:    mapToRole(fullJabatan, extractedDivisi),
                jabatan: fullJabatan,
                divisi:  extractedDivisi,
                cabang:  apiUser?.cabang  || '',
                token:   access_token,
                source:  'api',
            };

            console.log('[Auth] User logged in:', userData);
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', access_token);
            return { success: true };
        }

        // 2. Fallback: jika API gagal karena jaringan/server down → coba mock
        //    (Jika API menolak credentials, jangan fallback - langsung return error)
        const isNetworkError = apiResult.message?.includes('terhubung') || apiResult.message?.includes('server');

        if (isNetworkError) {
            console.warn('[Auth] API tidak tersedia, menggunakan data mock...');
            const foundUser = USER_SEEDER.find(
                u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password
            );

            if (foundUser) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const { password: _p, ...userWithoutPassword } = foundUser;
                        setUser(userWithoutPassword);
                        setIsAuthenticated(true);
                        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
                        resolve({ success: true });
                    }, 600);
                });
            }
            return Promise.resolve({ success: false, message: 'Username atau password salah' });
        }

        // API bisa dijangkau tapi credentials salah
        return Promise.resolve({ success: false, message: apiResult.message || 'Username atau password salah' });
    };

    // ── Logout ───────────────────────────────────────────────────────────────
    const logout = async () => {
        const token = user?.token || localStorage.getItem('token');
        if (token) {
            await authAPI.logout(token);
        }
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    // ── Update profil lokal ──────────────────────────────────────────────────
    const updateProfile = (profileData) => {
        const updated = { ...user, ...profileData };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
