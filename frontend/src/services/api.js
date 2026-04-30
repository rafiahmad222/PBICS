/**
 * API Service Layer
 * Menghubungkan frontend ke backend Laravel via ngrok
 */

// Gunakan proxy '/api' saat development untuk menghindari CORS, atau full URL saat production
// Gunakan proxy '/api' agar tidak kena CORS (OPTIONS) saat development
// Gunakan proxy '/api' saat development untuk menghindari CORS
const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]'
);
const BASE_URL = isLocalhost ? '/api' : 'https://314b-112-78-133-197.ngrok-free.app';

// Default headers - wajib ada ngrok-skip-browser-warning agar tidak redirect ke halaman ngrok
const getHeaders = (token = null) => {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

/**
 * AUTH ENDPOINTS
 */
export const authAPI = {
    /**
     * Login ke backend
     * @param {string} usernameOrEmail - bisa username atau email
     * @param {string} password
     * @returns {Promise<{success: boolean, data?: object, message?: string}>}
     */
    login: async (usernameOrEmail, password) => {
        try {
            // Backend expect: 'Username' dan 'Password' (kapital)
            const body = { Username: usernameOrEmail, Password: password };

            console.log('[API] Login payload:', { Username: usernameOrEmail, Password: '***' });

            const response = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(body),
            });

            const data = await response.json();
            console.log('[API] Login response:', response.status, data);

            if (response.ok) {
                return { success: true, data };
            } else {
                // 422 = validasi gagal — tampilkan detail error
                if (response.status === 422 && data.errors) {
                    const firstError = Object.values(data.errors).flat()[0];
                    return { success: false, message: firstError || data.message || 'Data tidak valid' };
                }
                return {
                    success: false,
                    message: data.message || 'Username atau password salah',
                };
            }
        } catch (error) {
            console.error('[API] Login error:', error);
            return {
                success: false,
                message: 'Tidak dapat terhubung ke server. Cek koneksi internet kamu.',
            };
        }
    },

    /**
     * Logout dari backend (invalidate token)
     * @param {string} token
     */
    logout: async (token) => {
        try {
            await fetch(`${BASE_URL}/logout`, {
                method: 'POST',
                headers: getHeaders(token),
            });
        } catch (error) {
            console.error('[API] Logout error:', error);
        }
    },
};

/**
 * KARYAWAN ENDPOINTS
 */
export const karyawanAPI = {
    /**
     * Ambil semua data karyawan (paginated)
     * @param {string} token
     * @param {number} page
     * @returns {Promise<{success: boolean, data?: object, message?: string}>}
     */
    getAll: async (token, page = 1) => {
        try {
            const response = await fetch(`${BASE_URL}/karyawan?page=${page}`, {
                method: 'GET',
                headers: getHeaders(token),
            });

            const json = await response.json();

            if (response.ok) {
                return { success: true, data: json };
            } else {
                return {
                    success: false,
                    message: json.message || 'Gagal mengambil data karyawan',
                };
            }
        } catch (error) {
            console.error('[API] Get karyawan error:', error);
            return {
                success: false,
                message: 'Tidak dapat terhubung ke server.',
            };
        }
    },

    /**
     * Ambil detail karyawan berdasarkan ID
     * @param {string} token
     * @param {string|number} id
     */
    getById: async (token, id) => {
        try {
            const response = await fetch(`${BASE_URL}/karyawan/${id}`, {
                method: 'GET',
                headers: getHeaders(token),
            });

            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json.data || json };
            } else {
                return { success: false, message: json.message || 'Gagal mengambil detail karyawan' };
            }
        } catch (error) {
            console.error('[API] Get detail karyawan error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    /**
     * Tambah data karyawan baru
     * @param {string} token
     * @param {object} data (Data form dari frontend)
     */
    create: async (token, data) => {
        try {
            // Map frontend state to backend expected fields
            const payload = {
                NamaLengkap_karyawan: data.name,
                Nomor_Identitas: data.nik,
                Tanggal_Lahir: data.tanggal_lahir,
                Tempat_Lahir: data.tempat_lahir || "Tidak Diketahui",
                Alamat: data.alamat,
                Divisi: data.divisi,
                Jabatan: data.posisi,
                Cabang: data.cabang,
                Email: data.email,
                No_Telp: data.phone,
                Username: data.username,
                Password: data.password,
                Tanggal_bergabung: data.tanggal_bergabung || new Date().toISOString().split('T')[0],
            };

            const response = await fetch(`${BASE_URL}/karyawan`, {
                method: 'POST',
                headers: getHeaders(token),
                body: JSON.stringify(payload),
            });

            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json };
            } else {
                if (response.status === 422 && json.errors) {
                    const firstError = Object.values(json.errors).flat()[0];
                    return { success: false, message: firstError || json.message || 'Data tidak valid' };
                }
                return { success: false, message: json.message || 'Gagal menambah karyawan' };
            }
        } catch (error) {
            console.error('[API] Create karyawan error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    /**
     * Update data karyawan
     * @param {string} token
     * @param {string|number} id
     * @param {object} data
     */
    update: async (token, id, data) => {
        try {
            // Map frontend state to backend expected fields
            const payload = {
                NamaLengkap_karyawan: data.name,
                Nomor_Identitas: data.nik,
                Tanggal_Lahir: data.tanggal_lahir,
                Tempat_Lahir: data.tempat_lahir || "Tidak Diketahui",
                Alamat: data.alamat,
                Divisi: data.divisi,
                Jabatan: data.posisi,
                Cabang: data.cabang,
                Email: data.email,
                No_Telp: data.phone,
                Username: data.username,
                Tanggal_bergabung: data.tanggal_bergabung,
            };

            // Only send password if it's being updated
            if (data.password && data.password.trim() !== '') {
                payload.Password = data.password;
            }

            const response = await fetch(`${BASE_URL}/karyawan/${id}`, {
                method: 'PUT',
                headers: getHeaders(token),
                body: JSON.stringify(payload),
            });

            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json };
            } else {
                if (response.status === 422 && json.errors) {
                    const firstError = Object.values(json.errors).flat()[0];
                    return { success: false, message: firstError || json.message || 'Data tidak valid' };
                }
                return { success: false, message: json.message || 'Gagal mengupdate karyawan' };
            }
        } catch (error) {
            console.error('[API] Update karyawan error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    /**
     * Hapus data karyawan
     * @param {string} token
     * @param {string|number} id
     */
    delete: async (token, id) => {
        try {
            const response = await fetch(`${BASE_URL}/karyawan/${id}`, {
                method: 'DELETE',
                headers: getHeaders(token),
            });

            if (response.ok) {
                return { success: true };
            } else {
                const json = await response.json();
                return { success: false, message: json.message || 'Gagal menghapus karyawan' };
            }
        } catch (error) {
            console.error('[API] Delete karyawan error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },
};

/* ─────────────────────────────────────────────────────────────
   Pasien API
───────────────────────────────────────────────────────────── */
export const pasienAPI = {
    getAll: async (token, page = 1) => {
        try {
            const response = await fetch(`${BASE_URL}/pasien?page=${page}`, {
                method: 'GET',
                headers: getHeaders(token),
            });
            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json };
            } else {
                return { success: false, message: json.message || 'Gagal mengambil data pasien' };
            }
        } catch (error) {
            console.error('[API] Get pasien error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    getById: async (token, id) => {
        try {
            const response = await fetch(`${BASE_URL}/pasien/${id}`, {
                method: 'GET',
                headers: getHeaders(token),
            });
            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json.data || json };
            } else {
                return { success: false, message: json.message || 'Gagal mengambil detail pasien' };
            }
        } catch (error) {
            console.error('[API] Get detail pasien error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    getNextNumbers: async (token) => {
        try {
            const response = await fetch(`${BASE_URL}/pasien/next-numbers`, {
                method: 'GET',
                headers: getHeaders(token),
            });
            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json.data || json };
            }
            return { success: false, message: json.message || 'Gagal mengambil nomor otomatis' };
        } catch (error) {
            console.error('[API] Get next numbers error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    create: async (token, data) => {
        try {
            const payload = {
                kode_Customer: data.kodeCustomer || null,
                no_member: data.noMember || null,
                Tipe_member: data.tipeMember || 'Non Member',
                tipe_member: data.tipeMember || 'Non Member',
                Tipe_Member: data.tipeMember || 'Non Member',
                no_RM: data.noRM,
                Nama_pasien: data.namaLengkap,
                no_Identitas: data.noIdentitas,
                Tempat_Lahir: data.tempatLahir,
                Tanggal_Lahir: data.tanggalLahir,
                Jenis_Kelamin: data.jenisKelamin,
                jenis_kelamin: data.jenisKelamin,
                Email: data.email || null,
                no_Telp: data.noTelepon,
                Alamat: data.alamat || null,
                KabKota_id: data.kabupatenKota || null,
                Kec_id: data.kecamatan || null,
            };

            const response = await fetch(`${BASE_URL}/pasien`, {
                method: 'POST',
                headers: getHeaders(token),
                body: JSON.stringify(payload),
            });

            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json };
            } else {
                if (response.status === 422 && json.errors) {
                    const firstError = Object.values(json.errors).flat()[0];
                    return { success: false, message: firstError || json.message || 'Data tidak valid' };
                }
                return { success: false, message: json.message || 'Gagal menambah pasien' };
            }
        } catch (error) {
            console.error('[API] Create pasien error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    update: async (token, id, data) => {
        try {
            const payload = {
                kode_Customer: data.kodeCustomer || null,
                no_member: data.noMember || null,
                Tipe_member: data.tipeMember || 'Non Member',
                tipe_member: data.tipeMember || 'Non Member',
                Tipe_Member: data.tipeMember || 'Non Member',
                no_RM: data.noRM,
                Nama_pasien: data.namaLengkap,
                no_Identitas: data.noIdentitas,
                Tempat_Lahir: data.tempatLahir,
                Tanggal_Lahir: data.tanggalLahir,
                Jenis_Kelamin: data.jenisKelamin,
                jenis_kelamin: data.jenisKelamin,
                Email: data.email || null,
                no_Telp: data.noTelepon,
                Alamat: data.alamat || null,
                KabKota_id: data.kabupatenKota || null,
                Kec_id: data.kecamatan || null,
            };

            const response = await fetch(`${BASE_URL}/pasien/${id}`, {
                method: 'PUT',
                headers: getHeaders(token),
                body: JSON.stringify(payload),
            });

            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json };
            } else {
                if (response.status === 422 && json.errors) {
                    const firstError = Object.values(json.errors).flat()[0];
                    return { success: false, message: firstError || json.message || 'Data tidak valid' };
                }
                return { success: false, message: json.message || 'Gagal mengupdate pasien' };
            }
        } catch (error) {
            console.error('[API] Update pasien error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    delete: async (token, id) => {
        try {
            const response = await fetch(`${BASE_URL}/pasien/${id}`, {
                method: 'DELETE',
                headers: getHeaders(token),
            });

            if (response.ok) {
                return { success: true };
            } else {
                const json = await response.json();
                return { success: false, message: json.message || 'Gagal menghapus pasien' };
            }
        } catch (error) {
            console.error('[API] Delete pasien error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },
};

/* ─────────────────────────────────────────────────────────────
   Wilayah API
───────────────────────────────────────────────────────────── */
export const wilayahAPI = {
    getKabKota: async (token) => {
        try {
            const response = await fetch(`${BASE_URL}/wilayah/kabkota`, {
                method: 'GET',
                headers: getHeaders(token),
            });
            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json.data || json };
            }
            return { success: false, message: json.message || 'Gagal mengambil data KabKota' };
        } catch (error) {
            console.error('[API] Get KabKota error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    getKecamatan: async (token, kabKotaId) => {
        try {
            const response = await fetch(`${BASE_URL}/wilayah/kecamatan/${kabKotaId}`, {
                method: 'GET',
                headers: getHeaders(token),
            });
            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json.data || json };
            }
            return { success: false, message: json.message || 'Gagal mengambil data Kecamatan' };
        } catch (error) {
            console.error('[API] Get Kecamatan error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    }
};

/* ─────────────────────────────────────────────────────────────
   Stok Produk API
───────────────────────────────────────────────────────────── */
export const stokProdukAPI = {
    getAll: async (token) => {
        try {
            const response = await fetch(`${BASE_URL}/stok-produk`, {
                method: 'GET',
                headers: getHeaders(token),
            });
            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json.data || json };
            }
            return { success: false, message: json.message || 'Gagal mengambil data stok produk' };
        } catch (error) {
            console.error('[API] Get stok produk error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    getById: async (token, id) => {
        try {
            const response = await fetch(`${BASE_URL}/stok-produk/${id}`, {
                method: 'GET',
                headers: getHeaders(token),
            });
            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json.data || json };
            }
            return { success: false, message: json.message || 'Gagal mengambil detail stok produk' };
        } catch (error) {
            console.error('[API] Get detail stok produk error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    create: async (token, data) => {
        try {
            const payload = {
                Kode_Produk: data.id,
                Nama_produk: data.name,
                Kategori: data.category,
                Harga: data.price,
                Stok: data.stock,
                Batas_minimal_stok: data.minStock,
            };

            const response = await fetch(`${BASE_URL}/stok-produk`, {
                method: 'POST',
                headers: getHeaders(token),
                body: JSON.stringify(payload),
            });

            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json };
            } else {
                if (response.status === 422 && json.errors) {
                    const firstError = Object.values(json.errors).flat()[0];
                    return { success: false, message: firstError || json.message || 'Data tidak valid' };
                }
                return { success: false, message: json.message || 'Gagal menambah stok produk' };
            }
        } catch (error) {
            console.error('[API] Create stok produk error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    update: async (token, id, data) => {
        try {
            const payload = {
                Kode_Produk: data.id,
                Nama_produk: data.name,
                Kategori: data.category,
                Harga: data.price,
                Stok: data.stock,
                Batas_minimal_stok: data.minStock,
            };

            const response = await fetch(`${BASE_URL}/stok-produk/${id}`, {
                method: 'PUT',
                headers: getHeaders(token),
                body: JSON.stringify(payload),
            });

            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json };
            } else {
                if (response.status === 422 && json.errors) {
                    const firstError = Object.values(json.errors).flat()[0];
                    return { success: false, message: firstError || json.message || 'Data tidak valid' };
                }
                return { success: false, message: json.message || 'Gagal mengupdate stok produk' };
            }
        } catch (error) {
            console.error('[API] Update stok produk error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },
    
    delete: async (token, id) => {
        try {
            const response = await fetch(`${BASE_URL}/stok-produk/${id}`, {
                method: 'DELETE',
                headers: getHeaders(token),
            });

            if (response.ok) {
                return { success: true };
            } else {
                const json = await response.json();
                return { success: false, message: json.message || 'Gagal menghapus stok produk' };
            }
        } catch (error) {
            console.error('[API] Delete stok produk error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },
};

export default { authAPI, karyawanAPI, pasienAPI, wilayahAPI, stokProdukAPI };
