# Panduan Pengujian API Reservasi (Reservasi API Testing Guide)

Dokumen ini berisi panduan lengkap bagi tim QA untuk menguji seluruh endpoint **Reservasi** pada aplikasi backend menggunakan Postman. Endpoint ini sangat kaya karena mendukung pembuatan reservasi biasa, registrasi pasien otomatis secara sekaligus, hingga pembuatan rekam medis secara dinamis.

---

## 📌 Ketentuan & Persiapan Awal

Sebelum memulai pengujian, pastikan langkah-langkah persiapan berikut sudah dilakukan:

1. **Base URL**: Tentukan base URL backend Anda (misalnya: `http://localhost:8000/api` atau domain staging/production Anda).
2. **Headers Wajib**: Pada setiap request di Postman, tambahkan header berikut pada tab **Headers**:
   * **Key**: `Accept`  
     **Value**: `application/json`
   * **Key**: `Content-Type`  
     **Value**: `application/json`
3. **Autentikasi (Bearer Token)**:
   Seluruh endpoint Reservasi dilindungi oleh middleware `auth:sanctum`. Silakan **Login** terlebih dahulu melalui endpoint `/api/login` untuk mendapatkan token akses, lalu sematkan token tersebut di tab **Authorization** -> **Bearer Token** pada setiap request berikutnya.

---

## 🧪 Skenario Pengujian Endpoint Reservasi

API Reservasi memiliki **dua skenario utama** saat melakukan penyimpanan data (`store`), yaitu:
1. **Skenario A**: Reservasi untuk pasien yang sudah terdaftar sebelumnya (menggunakan `pasien_id`).
2. **Skenario B**: Reservasi sekaligus mendaftarkan pasien baru ke sistem (menggunakan bendera `register_pasien = true`).

Berikut adalah panduan lengkap untuk masing-masing skenario:

---

### 1. Skenario A: Membuat Reservasi Pasien Terdaftar
Skenario ini digunakan jika pasien tersebut sudah memiliki akun/data di klinik (sudah ada `pasien_id`).

* **Method**: `POST`
* **URL**: `{{base_url}}/reservasi`
* **Authorization**: `Bearer Token`
* **Body** (`raw` -> `JSON`):
  ```json
  {
      "Tanggal_reservasi": "2026-06-05",
      "Jam_reservasi": "14:30",
      "pasien_id": "99db6c0e-436f-4a0b-851e-3558b90b8f04", 
      "No_Telp": "081234567890",
      "karyawan_id": "99db6bf6-d2be-4977-bc63-125de0b73c4d", 
      "Keterangan": "Konsultasi kulit sensitif dan jerawat",
      "treatment_ids": [1, 2],
      "paket_treatment_ids": [1]
  }
  ```
  > 💡 **Info**: Sistem akan otomatis membuat data **Rekam Medis** baru untuk pasien tersebut dan menghubungkannya dengan reservasi ini, serta menyinkronkan daftar treatment ke rekam medis.

---

### 2. Skenario B: Reservasi Sekaligus Registrasi Pasien Baru
Skenario ini digunakan jika pasien baru pertama kali datang. Sistem akan secara otomatis membuat nomor **RM (Rekam Medis)** dan **Kode Customer**, lalu menyimpannya ke tabel `data_pasiens` sebelum membuat reservasi.

* **Method**: `POST`
* **URL**: `{{base_url}}/reservasi`
* **Authorization**: `Bearer Token`
* **Body** (`raw` -> `JSON`):
  ```json
  {
      "Tanggal_reservasi": "2026-06-06",
      "Jam_reservasi": "10:00",
      "Nama_pasien": "Rafi Ahmad",
      "No_Telp": "08987654321",
      "karyawan_id": "99db6bf6-d2be-4977-bc63-125de0b73c4d",
      "Keterangan": "Laser Brightening Treatment",
      "treatment_ids": [2],
      
      "register_pasien": true,
      "no_Identitas": "3273012345678901",
      "Tempat_Lahir": "Bandung",
      "Tanggal_Lahir": "1998-05-15",
      "Jenis_Kelamin": "Laki-laki",
      "Email": "rafiahmad@example.com",
      "Alamat": "Jl. Merdeka No. 45, Bandung",
      "KabKota_id": "99db6be6-4bc3-4876-b9ab-b1960d3d5f12",
      "Kec_id": "99db6bee-3850-410a-8bf8-232115372483",
      "Tipe_Member": "Non Member"
  }
  ```
  > ⚠️ **Aturan Penting**: 
  > Jika `register_pasien` diatur ke `true`, maka kolom berikut **wajib diisi (required_if)**:
  > `no_Identitas`, `Tempat_Lahir`, `Tanggal_Lahir`, `Jenis_Kelamin`, `KabKota_id`, dan `Kec_id`.
  > Nilai `Jenis_Kelamin` harus berupa `Laki-laki` atau `Perempuan` (sistem akan mengonversinya secara otomatis menjadi `L` atau `P` di database).

---

### 3. Tampilkan Seluruh Daftar Reservasi (`index`)
* **Method**: `GET`
* **URL**: `{{base_url}}/reservasi`
* **Authorization**: `Bearer Token`
* **Respon Sukses yang Diharapkan (200 OK)**: Menampilkan seluruh reservasi yang diurutkan dari yang terbaru, lengkap beserta relasi `pasien`, `karyawan`, `treatment`, `paketTreatment`, dan `rekamMedis`.

---

### 4. Tampilkan Detail Reservasi Tertentu (`show`)
* **Method**: `GET`
* **URL**: `{{base_url}}/reservasi/{id}` *(Contoh: `{{base_url}}/reservasi/1`)*
* **Authorization**: `Bearer Token`

---

### 5. Memperbarui Data Reservasi (`update`)
Melakukan pembaruan pada data reservasi. Update ini bersifat dinamis; jika `pasien_id` diubah, sistem akan otomatis menyesuaikan atau membuat rekam medis baru.
* **Method**: `PUT` *(atau `PATCH`)*
* **URL**: `{{base_url}}/reservasi/{id}` *(Contoh: `{{base_url}}/reservasi/1`)*
* **Authorization**: `Bearer Token`
* **Body** (`raw` -> `JSON`):
  ```json
  {
      "Tanggal_reservasi": "2026-06-07",
      "Jam_reservasi": "11:00",
      "Keterangan": "Jadwal diundur atas permintaan pasien",
      "treatment_ids": [2, 3]
  }
  ```

---

### 6. Menghapus Reservasi (`destroy`)
Menghapus reservasi dari sistem. 
* **Method**: `DELETE`
* **URL**: `{{base_url}}/reservasi/{id}` *(Contoh: `{{base_url}}/reservasi/1`)*
* **Authorization**: `Bearer Token`
* **Perilaku Sistem**: Penghapusan reservasi akan secara otomatis menghapus data **Rekam Medis** terkait yang telah dibuat saat reservasi agar data tetap bersih dan konsisten.

---

## 🛠️ Panduan Pengujian Kasus Negatif (Negative Testing) untuk QA

Berikut adalah skenario pengujian kasus error (kegagalan) untuk memastikan validasi API berjalan dengan baik:

1. **Akses Tanpa Token**: Panggil API tanpa menyertakan `Bearer Token`.  
   * *Ekspektasi*: Status **`401 Unauthorized`**.
2. **Format Jam Reservasi Salah**: Kirim format jam `Jam_reservasi` dengan nilai `14:30:00` atau `2 Sore`.  
   * *Ekspektasi*: Status **`422 Unprocessable Content`** karena tidak memenuhi aturan `date_format:H:i`.
3. **Mendaftarkan Pasien Baru Tanpa Data Lengkap**: Kirim `register_pasien: true` namun kosongkan field `Tempat_Lahir` atau `no_Identitas`.  
   * *Ekspektasi*: Status **`422 Unprocessable Content`** karena terpicu aturan `required_if:register_pasien,true`.
4. **Pasien / Karyawan / Treatment / Paket Tidak Valid**: Kirim `pasien_id`, `karyawan_id`, atau item di dalam `treatment_ids` dengan ID yang tidak terdaftar di database (misalnya: `99999`).  
   * *Ekspektasi*: Status **`422 Unprocessable Content`** akibat validasi `exists`.
5. **Reservasi Non-Pasien tanpa Nama**: Kirim request tanpa `pasien_id` dan tanpa `Nama_pasien`.  
   * *Ekspektasi*: Status **`422 Unprocessable Content`** akibat aturan `required_without:pasien_id` pada `Nama_pasien`.
