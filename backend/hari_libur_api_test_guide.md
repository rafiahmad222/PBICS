# Panduan Pengujian API Hari Libur (Hari Libur API Testing Guide)

Dokumen ini berisi panduan lengkap bagi tim QA untuk menguji seluruh endpoint **Hari Libur** pada aplikasi backend menggunakan Postman.

---

## 📌 Ketentuan & Persiapan Awal

Sebelum memulai pengujian, pastikan langkah-langkah persiapan berikut sudah dilakukan:

1. **Base URL**: Tentukan base URL backend Anda (misalnya: `http://localhost:8000/api` atau domain staging/production Anda).
2. **Headers Wajib**: Pada setiap request di Postman, tambahkan header berikut pada tab **Headers**:
   * **Key**: `Accept`  
     **Value**: `application/json`
3. **Autentikasi (Bearer Token)**:
   Seluruh endpoint Hari Libur dilindungi oleh middleware `auth:sanctum`. Silakan **Login** terlebih dahulu melalui endpoint `/api/login` untuk mendapatkan token akses, lalu sematkan token tersebut di tab **Authorization** -> **Bearer Token** pada setiap request berikutnya.
   * *Catatan khusus*: Untuk menambahkan (`store`) atau menghapus (`destroy`) hari libur, Anda wajib menggunakan token akun karyawan yang memiliki divisi **HRD**, **Owner**, atau **Super Admin**.

---

## 🧪 Pengujian Endpoint Hari Libur

---

### 1. Tampilkan Semua Hari Libur (`index`)
Menampilkan seluruh data hari libur yang telah terdaftar, diurutkan berdasarkan tanggal mulai paling awal.

* **Method**: `GET`
* **URL**: `{{base_url}}/hari-libur`
* **Authorization**: `Bearer Token` *(Bisa diakses oleh semua divisi)*
* **Respon Sukses yang Diharapkan (200 OK)**:
  ```json
  {
      "message": "Data hari libur berhasil diambil.",
      "data": [
          {
              "id": 1,
              "nama_hari_libur": "Idul Adha",
              "jenis_hari_libur": "Nasional",
              "tanggal_mulai": "2026-06-25",
              "tanggal_selesai": "2026-06-25",
              "keterangan": "Libur Hari Raya Idul Adha 1447 H",
              "created_at": "2026-06-15T17:40:00.000000Z",
              "updated_at": "2026-06-15T17:40:00.000000Z"
          }
      ]
  }
  ```

---

### 2. Tambah Hari Libur Baru (`store`)
Menambahkan data hari libur baru ke dalam sistem.

* **Method**: `POST`
* **URL**: `{{base_url}}/hari-libur`
* **Authorization**: `Bearer Token` *(Wajib HRD / Owner / Super Admin)*
* **Headers**:
  * `Content-Type`: `application/json`
* **Body** (`raw` -> `JSON`):
  ```json
  {
      "nama_hari_libur": "Tahun Baru Hijriah",
      "jenis_hari_libur": "Nasional",
      "tanggal_mulai": "2026-07-16",
      "tanggal_selesai": "2026-07-16",
      "keterangan": "Libur Tahun Baru Islam 1448 H"
  }
  ```

| Field | Type | Required | Keterangan / Validasi |
| :--- | :--- | :--- | :--- |
| `nama_hari_libur` | String | **Ya** | Nama hari libur |
| `jenis_hari_libur` | String | **Ya** | Jenis hari libur (misal: "Nasional", "Kustom", dll) |
| `tanggal_mulai` | Date | **Ya** | Tanggal mulai libur (Format: `YYYY-MM-DD`) |
| `tanggal_selesai` | Date | **Ya** | Tanggal selesai libur (Format: `YYYY-MM-DD`) |
| `keterangan` | String | Tidak | Detail tambahan mengenai hari libur (opsional) |

* **Respon Sukses yang Diharapkan (201 Created)**:
  ```json
  {
      "message": "Berhasil, Data Hari Libur berhasil ditambahkan",
      "data": {
          "id": 2,
          "nama_hari_libur": "Tahun Baru Hijriah",
          "jenis_hari_libur": "Nasional",
          "tanggal_mulai": "2026-07-16",
          "tanggal_selesai": "2026-07-16",
          "keterangan": "Libur Tahun Baru Islam 1448 H",
          "updated_at": "2026-06-15T17:45:00.000000Z",
          "created_at": "2026-06-15T17:45:00.000000Z"
      }
  }
  ```
* **Respon Gagal Validasi (422 Unprocessable Content)**:
  ```json
  {
      "message": "Harap lengkapi semua form wajib!"
  }
  ```

---

### 3. Hapus Hari Libur Berdasarkan ID (`destroy`)
Menghapus data hari libur dari database.

* **Method**: `DELETE`
* **URL**: `{{base_url}}/hari-libur/{id}` *(Ganti `{id}` dengan ID hari libur yang ingin dihapus)*
* **Authorization**: `Bearer Token` *(Wajib HRD / Owner / Super Admin)*

* **Respon Sukses yang Diharapkan (200 OK)**:
  ```json
  {
      "message": "Data hari libur berhasil dihapus."
  }
  ```
* **Respon Gagal - Tidak Ditemukan (404 Not Found)**:
  ```json
  {
      "message": "Data hari libur tidak ditemukan."
  }
  ```
