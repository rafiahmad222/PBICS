# Panduan Pengujian API Absensi (Absensi API Testing Guide)

Dokumen ini berisi panduan lengkap bagi tim QA untuk menguji seluruh endpoint **Absensi & Pengajuan Lembur/Terlambat** pada aplikasi backend menggunakan Postman. Dokumen ini juga mencakup aturan pengujian lokasi (radius kantor) dan file upload di Laravel.

---

## 📌 Ketentuan & Persiapan Awal

Sebelum memulai pengujian, pastikan langkah-langkah persiapan berikut sudah dilakukan:

1. **Base URL**: Tentukan base URL backend Anda (misalnya: `http://localhost:8000/api` atau domain staging/production Anda).
2. **Headers Wajib**: Pada setiap request di Postman, tambahkan header berikut pada tab **Headers**:
   * **Key**: `Accept`  
     **Value**: `application/json`
3. **Autentikasi (Bearer Token)**:
   Seluruh endpoint Absensi dilindungi oleh middleware `auth:sanctum`. Silakan **Login** terlebih dahulu melalui endpoint `/api/login` untuk mendapatkan token akses, lalu sematkan token tersebut di tab **Authorization** -> **Bearer Token** pada setiap request berikutnya.
4. **Postman Collection**: Anda juga dapat mengimpor file [PBICS_Absensi_Postman_Collection.json](file:///d:/PBICS/backend/PBICS_Absensi_Postman_Collection.json) ke Postman Anda untuk mempercepat pengujian.

---

## 🧪 Pengujian Endpoint Absensi

API Absensi mendukung proses Check-in dan Check-out dalam satu endpoint yang sama dengan validasi radius lokasi serta upload berkas gambar selfie.

---

### 1. Melakukan Absensi Masuk / Keluar (Store - Check-in & Check-out)
Ketika memanggil endpoint ini, sistem akan otomatis menentukan apakah tindakan tersebut merupakan **Check-in** (jika belum absen hari ini) atau **Check-out** (jika sudah Check-in). 

Karena endpoint ini membutuhkan file upload berupa foto, Anda **wajib** mengubah format body di Postman menjadi **`form-data`**.

* **Method**: `POST`
* **URL**: `{{base_url}}/absensi`
* **Authorization**: `Bearer Token`
* **Body** (Pilih **`form-data`** di Postman):

| Key | Type | Value (Contoh) | Keterangan |
| :--- | :--- | :--- | :--- |
| `gambar` | **File** | *(Pilih file foto selfie berukuran < 10MB)* | Foto selfie saat absensi |
| `lokasi` | Text | `-8.165454875316666,113.71174444623048` | Format koordinat: `"latitude,longitude"` |
| `alasan_keterangan` | Text | `Ban motor bocor di jalan raya.` | **Wajib diisi min 10 karakter** jika Anda melakukan check-in terlambat |

> 📍 **PENTING (Validasi Jarak / Radius Kantor)**:
> Sistem membatasi jarak absensi maksimal **100 meter** dari lokasi kantor cabang karyawan yang bersangkutan. Jika jarak melebihi batas, Anda akan mendapatkan error `422 Unprocessable Content`. 
> * Gunakan lokasi Jember berikut untuk Karyawan Cabang Jember: `-8.165454875316666,113.71174444623048`
> * Gunakan lokasi Lumajang berikut untuk Karyawan Cabang Lumajang: `-8.155995703589348,113.25270886383797`

---

### 2. Tampilkan Rekap Absensi Seluruh Karyawan (`index`)
Menampilkan data rekap absensi seluruh karyawan dengan paginasi (10 data per halaman).

* **Method**: `GET`
* **URL**: `{{base_url}}/absensi`
* **Authorization**: `Bearer Token`
* **Params** (Query Params - Opsional):
  * `search`: *Nama Karyawan* (Mencari berdasarkan nama karyawan)
  * `tanggal`: `2026-06-15` (Format: `YYYY-MM-DD`, mencari absensi pada tanggal tertentu)

* **Respon Sukses yang Diharapkan (200 OK)**:
  ```json
  {
      "message": "Rekap absensi berhasil diambil.",
      "hari_libur": null,
      "data": {
          "current_page": 1,
          "data": [
              {
                  "id": 1,
                  "Nama_Karyawan": "Budi Santoso",
                  "Tanggal": "2026-06-15",
                  "Ket_Shift": "Shift Pagi",
                  "Jam_Masuk": "08:00:00",
                  "Jam_Keluar": "16:00:00",
                  "Jabatan": "STAF - ADMINISTRASI",
                  "Status": "Tepat Waktu"
              }
          ],
          ...
      }
  }
  ```

---

## 🛡️ Pengujian Endpoint Pengajuan & Review Lembur / Terlambat
*Endpoint di bawah ini hanya dapat diakses oleh Karyawan dengan Divisi: **HRD**, **Owner**, atau **Super Admin**.*

---

### 3. Mengambil Data Pengajuan Lembur / Terlambat (`getPengajuanLembur`)
* **Method**: `GET`
* **URL**: `{{base_url}}/pengajuan-lembur`
* **Authorization**: `Bearer Token` *(Menggunakan token milik HRD/Owner/Super Admin)*
* **Params** (Query Params - Opsional):
  * `status`: `PENDING` / `DISETUJUI` / `DITOLAK` (Filter berdasarkan status pengajuan)

* **Respon Sukses (200 OK)**: Mengembalikan daftar data absensi karyawan yang memiliki status absen 'Terlambat', 'Lembur', atau yang status pengajuannya tidak bernilai null.

---

### 4. Tampilkan Detail Pengajuan Berdasarkan ID (`showPengajuanLembur`)
* **Method**: `GET`
* **URL**: `{{base_url}}/pengajuan-lembur/{id}` *(Ganti `{id}` dengan ID absensi yang valid)*
* **Authorization**: `Bearer Token` *(Menggunakan token milik HRD/Owner/Super Admin)*

---

### 5. Menyetujui atau Menolak Pengajuan Lembur / Terlambat (`reviewPengajuanLembur`)
* **Method**: `POST`
* **URL**: `{{base_url}}/pengajuan-lembur/{id}/review` *(Ganti `{id}` dengan ID absensi yang ingin direview)*
* **Authorization**: `Bearer Token` *(Menggunakan token milik HRD/Owner/Super Admin)*
* **Headers**:
  * `Content-Type`: `application/json`
* **Body** (`raw` -> `JSON`):
  ```json
  {
      "status_pengajuan": "DISETUJUI"
  }
  ```
  *(Isian untuk `"status_pengajuan"` hanya diperbolehkan bernilai `"DISETUJUI"` atau `"DITOLAK"`)*

* **Respon Sukses yang Diharapkan (200 OK)**:
  * Jika disetujui: `"Berhasil, Pengajuan Lembur telah disetujui"`
  * Jika ditolak: `"Gagal, pengajuan lembur berhasil di tolak"`
