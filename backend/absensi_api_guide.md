# Dokumentasi API & Integrasi Frontend - Fitur Absensi, Cuti, & Hari Libur PBICS

Panduan ini berisi daftar endpoint, payload request, skenario response, serta pesan notifikasi (toast/warning) yang perlu diintegrasikan di sisi frontend.

Semua request ke API dilindungi oleh middleware **Sanctum**, sehingga wajib menyertakan Headers:
- `Authorization: Bearer <access_token>`
- `Accept: application/json`

---

## 1. Melakukan Absensi (Check-In & Check-Out)

- **Method:** `POST`
- **Endpoint:** `/api/absensi`
- **Deskripsi:** Endpoint tunggal untuk Check-in dan Check-out. Backend otomatis mendeteksi apakah karyawan melakukan check-in atau check-out.
- **Payload (JSON):**
  ```json
  {
    "gambar": "string_base64_foto_kamera_atau_file_path",
    "lokasi": "-8.165356210585704,113.71176020924715", // Format string "latitude,longitude"
    "alasan_keterangan": "Ban bocor mogok di jalan raya" // Wajib jika terlambat >= 15 menit
  }
  ```

### Skenario Response & Notifikasi:
- **Check-in Tepat Waktu (Status `201`):**
  - **Kondisi:** Waktu check-in < 15 menit dari jadwal shift.
  - **Pesan Toast:** `"Check-in berhasil! Selamat bekerja"`
- **Check-in Terlambat (Status `201`):**
  - **Kondisi:** Waktu check-in >= 15 menit dari jadwal shift dan menyertakan `alasan_keterangan` (min. 10 karakter).
  - **Pesan Toast:** `"Berhasil, Pengajuan berhasil dikirim untuk review"`
- **Check-out Sukses (Status `200`):**
  - **Kondisi:** Sudah check-in sebelumnya dan melakukan absen keluar.
  - **Pesan Toast:** `"Check-out berhasil! Sampai jumpa"`
- **Peringatan Validasi Alasan (Status `422`):**
  - **Kondisi:** Check-in terlambat tapi alasan kosong / < 10 karakter.
  - **Pesan Warning (di bawah textbox alasan):** `"Alasan wajib diisi minimal 10 karakter"`
- **Peringatan Radius Kantor (Status `422`):**
  - **Kondisi:** Absen dari luar radius 100m kantor dan tidak memiliki izin luar kantor dari HRD.
  - **Pesan Toast Error:** `"Gagal, Anda harus melakukan absensi di area kantor!"`

---

## 2. Rekap Absensi Seluruh Karyawan (Halaman Utama)

- **Method:** `GET`
- **Endpoint:** `/api/absensi`
- **Query Parameters (Opsional):**
  - `search` (Pencarian nama karyawan)
  - `tanggal` (Filter tanggal tertentu, format: `YYYY-MM-DD`)
- **Struktur Response (`200`):**
  ```json
  {
    "message": "Rekap absensi berhasil diambil.",
    "data": {
      "data": [
        {
          "id": "uuid-absensi",
          "Nama_Karyawan": "Dr. Budi Utomo",
          "Tanggal": "2026-06-02",
          "Ket_Shift": "Pagi",
          "Jam_Masuk": "08:30:00",
          "Jam_Keluar": "17:05:00",
          "Jabatan": "DOKTER - DOKTER", // Format gabungan JABATAN - DIVISI
          "Status": "Tepat Waktu"
        }
      ]
    }
  }
  ```

---

## 3. Membuat Pengajuan Cuti (Form Cuti Karyawan)

- **Method:** `POST`
- **Endpoint:** `/api/pengajuan-cuti`
- **Payload (JSON):**
  ```json
  {
    "jenis_cuti": "SAKIT", // SAKIT, CUTI TAHUNAN, IZIN, dll
    "tanggal_mulai": "2026-06-15",
    "tanggal_selesai": "2026-06-16",
    "alasan": "Sakit demam tinggi",
    "gambar_bukti_cuti": "string_base64_atau_file_bukti" // Wajib jika jenis_cuti = SAKIT
  }
  ```

### Skenario Response & Notifikasi:
- **Form Tidak Lengkap (Status `422`):**
  - **Pesan Toast:** `"Gagal, Harap lengkapi semua form!"`
- **Cuti Sakit Tanpa Bukti (Status `422`):**
  - **Pesan Warning (di bawah upload bukti):** `"Bukti wajib diisi!!!"`
- **Pengajuan Berhasil (Status `201`):**
  - **Pesan Toast:** `"Pengajuan cuti berhasil dikirim"`

---

## 4. Persetujuan Pengajuan Cuti (HRD / Admin / Owner)

- **List Pengajuan Cuti:** `GET /api/pengajuan-cuti`
- **Detail Pengajuan Cuti:** `GET /api/pengajuan-cuti/{id}`
- **Review Persetujuan Cuti:** `POST /api/pengajuan-cuti/{id}/review`
- **Payload (JSON):**
  ```json
  {
    "status_pengajuan": "DISETUJUI" // DISETUJUI atau DITOLAK
  }
  ```

### Skenario Response & Notifikasi (`200`):
- Jika status **DISETUJUI** -> Toast: `"Berhasil, Pengajuan cuti disetujui."`
- Jika status **DITOLAK** -> Toast: `"Pengajuan cuti ditolak."`

---

## 5. Persetujuan Lembur / Terlambat (HRD / Admin / Owner)

- **List Pengajuan Lembur:** `GET /api/pengajuan-lembur`
- **Detail Pengajuan Lembur:** `GET /api/pengajuan-lembur/{id}`
- **Review Persetujuan Lembur:** `POST /api/pengajuan-lembur/{id}/review`
- **Payload (JSON):**
  ```json
  {
    "status_pengajuan": "DISETUJUI" // DISETUJUI atau DITOLAK
  }
  ```

### Skenario Response & Notifikasi (`200`):
- Jika status **DISETUJUI** -> Toast: `"Berhasil, Pengajuan Lembur telah disetujui"`
- Jika status **DITOLAK** -> Toast: `"Gagal, pengajuan lembur berhasil di tolak"`

---

## 6. Pengaturan Absensi Kustom (HRD - Icon Gear Karyawan)

- **Method:** `POST`
- **Endpoint:** `/api/absensi-config`
- **Payload (JSON):**
  ```json
  {
    "karyawan_id": "uuid-karyawan",
    "tanggal": "2026-06-03",
    "ket_shift": "Siang",
    "lokasi_checkin": "Luar Kantor", // Kantor / Luar Kantor
    "lokasi_checkout": "Kantor", // Kantor / Luar Kantor
    "keterangan": "Dinas Luar Kota"
  }
  ```

### Skenario Response & Notifikasi:
- **Tanggal Kosong (Status `422`):** Warning: `"Tanggal Wajib Diisi"`
- **Ket Shift Kosong (Status `422`):** Warning: `"Keterangan Shift karyawan Wajib Diisi"`
- **Lokasi Check-in/out Kosong (Status `422`):** Warning: `"Lokasi absensi Wajib Diisi"`
- **Pengaturan Berhasil Berubah (Status `200`):** Toast: `"Berhasil, Pengaturan absensi karyawan berhasil diubah"`

---

## 7. Pengaturan Hari Libur (HRD - Kalender Hari Libur)

- **Tambah Hari Libur:** `POST /api/hari-libur`
  - **Payload (JSON):**
    ```json
    {
      "nama_hari_libur": "Hari Idul Adha",
      "jenis_hari_libur": "Nasional",
      "tanggal_mulai": "2026-06-25",
      "tanggal_selesai": "2026-06-25",
      "keterangan": "Libur Idul Adha 1447 H" // Opsional
    }
    ```
  - **Validation Gagal (Status `422`):** Toast: `"Harap lengkapi semua form wajib!"`
  - **Response Sukses (Status `201`):** Toast: `"Berhasil, Data Hari Libur berhasil ditambahkan"`
- **Daftar Hari Libur:** `GET /api/hari-libur`
- **Hapus Hari Libur:** `DELETE /api/hari-libur/{id}`

---

## 8. Mode Ramadhan Global (HRD)

- **Method:** `POST`
- **Endpoint:** `/api/settings/mode-ramadhan`
- **Payload (JSON):**
  ```json
  {
    "is_active": true // true untuk mengaktifkan, false untuk menonaktifkan
  }
  ```
- **Response Sukses (Status `200`):** Toast: `"Mode Ramadhan berhasil diperbarui."`
