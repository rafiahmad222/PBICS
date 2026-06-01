# Panduan Pengujian API Rekam Medis (Rekam Medis API Testing Guide)

Dokumen ini berisi panduan lengkap bagi tim QA untuk menguji seluruh endpoint **Rekam Medis** pada aplikasi backend menggunakan Postman. Dokumen ini juga mencakup panduan khusus pengujian berkas gambar (file upload) di Laravel dan Postman.

---

## 📌 Ketentuan & Persiapan Awal

Sebelum memulai pengujian, pastikan langkah-langkah persiapan berikut sudah dilakukan:

1. **Base URL**: Tentukan base URL backend Anda (misalnya: `http://localhost:8000/api` atau domain staging/production Anda).
2. **Headers Wajib**: Pada setiap request di Postman, tambahkan header berikut pada tab **Headers**:
   * **Key**: `Accept`  
     **Value**: `application/json`
3. **Autentikasi (Bearer Token)**:
   Seluruh endpoint Rekam Medis dilindungi oleh middleware `auth:sanctum`. Silakan **Login** terlebih dahulu melalui endpoint `/api/login` untuk mendapatkan token akses, lalu sematkan token tersebut di tab **Authorization** -> **Bearer Token** pada setiap request berikutnya.

---

## 🧪 Pengujian Endpoint Rekam Medis

API Rekam Medis mendukung pengiriman data biasa (JSON) maupun pengiriman berkas gambar sebelum & sesudah tindakan (menggunakan `form-data`).

---

### 1. Tambah Rekam Medis Baru (Store - Tanpa Gambar)
Metode ini paling mudah diuji jika hanya ingin mengirimkan data teks/JSON.

* **Method**: `POST`
* **URL**: `{{base_url}}/rekam-medis`
* **Authorization**: `Bearer Token`
* **Headers**:
  * `Content-Type`: `application/json`
* **Body** (`raw` -> `JSON`):
  ```json
  {
      "data_pasien_id": "99db6c0e-436f-4a0b-851e-3558b90b8f04",
      "tanggal_kunjungan": "2026-05-31",
      "dokter_id": "99db6bf6-d2be-4977-bc63-125de0b73c4d",
      "tekanan_darah": "120/80 mmHg",
      "riwayat_penyakit": "Alergi Seafood",
      "keluhan_pasien": "Kulit wajah kemerahan dan gatal setelah menggunakan kosmetik baru",
      "perawatan_diklinik_sebelumnya": "Tidak ada",
      "diagnosa": "Contact Dermatitis",
      "catatan_tindakan": "Pemberian soothing cream dan hindari paparan kosmetik selama 3 hari",
      "racikan": "Krim Soothing B3",
      "treatments": [1, 2],
      "reseps": [
          {
              "stok_produk_id": 1,
              "jumlah": 2
          },
          {
              "stok_produk_id": 3,
              "jumlah": 1
          }
      ]
  }
  ```
  > 💡 **Info**: ID Pasien (`data_pasien_id`) dan ID Dokter (`dokter_id`) wajib menggunakan format **UUID**. Sedangkan `stok_produk_id` dan `treatments` menggunakan format **Integer**.

---

### 2. Tambah Rekam Medis Baru (Store - Dengan Gambar)
Jika Anda ingin menguji upload gambar `gambar_sebelum` dan `gambar_sesudah`, Anda **wajib** mengubah format body di Postman menjadi **`form-data`**.

* **Method**: `POST`
* **URL**: `{{base_url}}/rekam-medis`
* **Authorization**: `Bearer Token`
* **Body** (Pilih **`form-data`** di Postman):

| Key | Type | Value (Contoh) | Keterangan |
| :--- | :--- | :--- | :--- |
| `data_pasien_id` | Text | `99db6c0e-436f-4a0b-851e-3558b90b8f04` | UUID Pasien |
| `tanggal_kunjungan` | Text | `2026-05-31` | YYYY-MM-DD |
| `dokter_id` | Text | `99db6bf6-d2be-4977-bc63-125de0b73c4d` | UUID Dokter |
| `tekanan_darah` | Text | `120/80 mmHg` | Teks bebas |
| `riwayat_penyakit` | Text | `Alergi Seafood` | Teks bebas |
| `keluhan_pasien` | Text | `Kulit gatal` | Teks bebas |
| `diagnosa` | Text | `Contact Dermatitis` | Teks bebas |
| `gambar_sebelum` | **File** | *(Pilih file foto wajah berukuran < 10MB)* | Gambar sebelum tindakan |
| `gambar_sesudah` | **File** | *(Pilih file foto wajah berukuran < 10MB)* | Gambar sesudah tindakan |
| `treatments[0]` | Text | `1` | ID Treatment ke-1 |
| `treatments[1]` | Text | `2` | ID Treatment ke-2 |
| `reseps[0][stok_produk_id]` | Text | `1` | ID Produk ke-1 |
| `reseps[0][jumlah]` | Text | `2` | Jumlah Produk ke-1 |
| `reseps[1][stok_produk_id]` | Text | `3` | ID Produk ke-2 |
| `reseps[1][jumlah]` | Text | `1` | Jumlah Produk ke-2 |

---

### 3. Tampilkan Seluruh Rekam Medis (`index`)
* **Method**: `GET`
* **URL**: `{{base_url}}/rekam-medis`
* **Authorization**: `Bearer Token`
* **Respon Sukses yang Diharapkan (200 OK)**: Menampilkan seluruh rekam medis beserta relasi lengkap (`pasien`, `dokter`, `treatments`, `reseps`).

---

### 4. Tampilkan Detail Rekam Medis Berdasarkan ID (`show`)
* **Method**: `GET`
* **URL**: `{{base_url}}/rekam-medis/{id}` *(Ganti `{id}` dengan ID rekam medis yang valid)*
* **Authorization**: `Bearer Token`

---

### 5. Memperbarui Rekam Medis (`update`)
> ⚠️ **TIPS PENTING LARAVEL & POSTMAN**:  
> Di Laravel, request dengan method `PUT` atau `PATCH` tidak mendukung upload berkas (`multipart/form-data`) secara alami karena keterbatasan internal PHP.  
> Untuk memperbarui rekam medis yang disertai **upload/ubah gambar**, Anda harus tetap menggunakan method **`POST`** di Postman dengan tambahan field spoofing method berikut di **`form-data`**:
> * **Key**: `_method`  
> * **Value**: `PUT`

* **Method**: **`POST`** *(Menggunakan Spoofing)*
* **URL**: `{{base_url}}/rekam-medis/{id}` *(Ganti `{id}` dengan ID yang ingin diupdate)*
* **Authorization**: `Bearer Token`
* **Body** (Pilih **`form-data`** di Postman):

| Key | Type | Value (Contoh) | Keterangan |
| :--- | :--- | :--- | :--- |
| `_method` | Text | `PUT` | **Wajib ditulis huruf besar!** |
| `data_pasien_id` | Text | `99db6c0e-436f-4a0b-851e-3558b90b8f04` | UUID Pasien |
| `tanggal_kunjungan` | Text | `2026-05-31` | YYYY-MM-DD |
| `keluhan_pasien` | Text | `Kulit mulai membaik` | Keluhan terupdate |
| `gambar_sesudah` | **File** | *(Pilih file foto wajah terbaru berukuran < 10MB)* | Upload foto kondisi terbaru |
| `treatments[0]` | Text | `1` | ID Treatment |

---

## 🛠️ Panduan Pengujian Kasus Negatif (Negative Testing) untuk QA

Berikut adalah skenario pengujian kasus error (kegagalan) untuk memastikan validasi API Rekam Medis berjalan dengan baik:

1. **Akses Tanpa Token**: Panggil API tanpa menyertakan `Bearer Token`.  
   * *Ekspektasi*: Status **`401 Unauthorized`**.
2. **Ukuran File Terlalu Besar (> 10 MB)**: Coba upload file gambar di field `gambar_sebelum` yang berukuran di atas 10MB (misalnya file foto mentah 15MB).  
   * *Ekspektasi*: Status **`422 Unprocessable Content`** dengan pesan error bahwa file melebihi batas ukuran maksimal (`max:10240` KB).
3. **Format File Salah**: Upload file dengan format `.txt`, `.pdf`, atau `.zip` pada field `gambar_sebelum` atau `gambar_sesudah`.  
   * *Ekspektasi*: Status **`422 Unprocessable Content`** akibat validasi `mimes:jpeg,png,jpg,webp`.
4. **Pasien / Dokter / Produk Tidak Terdaftar**: Kirim UUID `data_pasien_id` atau `dokter_id` secara acak yang tidak terdaftar di database.  
   * *Ekspektasi*: Status **`422 Unprocessable Content`** akibat kegagalan validasi `exists`.
5. **Jumlah Produk Resep Bernilai Nol**: Kirim `jumlah` produk resep dengan nilai `0` atau `-5`.  
   * *Ekspektasi*: Status **`422 Unprocessable Content`** dengan pesan error `"jumlah treatment minimal 1"`.
