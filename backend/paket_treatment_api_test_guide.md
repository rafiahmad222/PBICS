# Panduan Pengujian API Paket Treatment (Package Treatment API Testing Guide)

Dokumen ini berisi panduan lengkap bagi tim QA untuk menguji seluruh endpoint **Paket Treatment** pada aplikasi backend menggunakan Postman.

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
   Seluruh endpoint Paket Treatment dilindungi oleh middleware `auth:sanctum`. Silakan **Login** terlebih dahulu melalui endpoint `/api/login` untuk mendapatkan token akses, lalu sematkan token tersebut di tab **Authorization** -> **Bearer Token** pada setiap request berikutnya.

---

## 🧪 Pengujian Endpoint Paket Treatment

### 1. Dapatkan Preview Kode Paket Treatment Berikutnya (`getNextNumber`)
Digunakan untuk melihat kode paket treatment otomatis terbaru yang akan dihasilkan oleh sistem (misalnya: `PTR-001`).
* **Method**: `GET`
* **URL**: `{{base_url}}/paket-treatment/next-number`
* **Authorization**: `Bearer Token`
* **Respon Sukses yang Diharapkan (200 OK)**:
  ```json
  {
      "status": "success",
      "data": {
          "next_number": "PTR-001"
      }
  }
  ```

---

### 2. Tambah Data Paket Treatment Baru (`store`)
Menambahkan paket treatment baru beserta daftar treatment beserta jumlah sesi yang termasuk di dalam paket tersebut.
* **Method**: `POST`
* **URL**: `{{base_url}}/paket-treatment`
* **Authorization**: `Bearer Token`
* **Body** (`raw` -> `JSON`):
  ```json
  {
      "Nama_paket": "Paket Glowing Wedding",
      "Deskripsi": "Paket perawatan khusus pranikah untuk hasil maksimal",
      "Harga_paket": 1200000,
      "treatments": [
          {
              "treatment_id": 1, 
              "Jumlah": 5
          },
          {
              "treatment_id": 2, 
              "Jumlah": 3
          }
      ]
  }
  ```
* **Aturan Khusus QA (Validasi & Relasi)**:
  * `Nama_paket` (wajib diisi, string, maksimal 100 karakter).
  * `Harga_paket` (wajib diisi, numerik).
  * `treatments` (wajib berupa array dengan minimal 1 item).
  * `treatments.*.treatment_id` (wajib ada dan harus terdaftar di tabel `treatments`).
  * `treatments.*.Jumlah` (wajib berupa integer dan minimal bernilai 1).

* **Respon Sukses yang Diharapkan (201 Created)**:
  ```json
  {
      "status": "success",
      "message": "Paket Treatment berhasil ditambahkan",
      "data": {
          "id": 1,
          "Kode_paket": "PTR-001",
          "Nama_paket": "Paket Glowing Wedding",
          "Deskripsi": "Paket perawatan khusus pranikah untuk hasil maksimal",
          "Harga_paket": 1200000,
          "treatments": [
              {
                  "id": 1,
                  "Kode_treatment": "TRT-001",
                  "Nama_treatment": "Facial Glowing Premium",
                  "Harga": 250000,
                  "pivot": {
                      "paket_treatment_id": 1,
                      "treatment_id": 1,
                      "Jumlah": 5
                  }
              },
              {
                  "id": 2,
                  "Kode_treatment": "TRT-002",
                  "Nama_treatment": "Laser Brightening",
                  "Harga": 400000,
                  "pivot": {
                      "paket_treatment_id": 1,
                      "treatment_id": 2,
                      "Jumlah": 3
                  }
              }
          ]
      }
  }
  ```

---

### 3. Tampilkan Seluruh Data Paket Treatment (`index`)
Melihat daftar semua paket treatment beserta relasi treatment di dalamnya.
* **Method**: `GET`
* **URL**: `{{base_url}}/paket-treatment`
* **Authorization**: `Bearer Token`
* **Respon Sukses yang Diharapkan (200 OK)**: Menampilkan seluruh paket treatment beserta relasi daftar treatment yang terikat.

---

### 4. Tampilkan Detail Paket Treatment Berdasarkan ID (`show`)
* **Method**: `GET`
* **URL**: `{{base_url}}/paket-treatment/{id}` *(Ganti `{id}` dengan ID paket treatment yang valid, contoh: `{{base_url}}/paket-treatment/1`)*
* **Authorization**: `Bearer Token`
* **Respon Sukses yang Diharapkan (200 OK)**: Menampilkan objek paket treatment lengkap dengan detail relasi treatment-nya.
* **Respon Error jika ID tidak ditemukan (404 Not Found)**:
  ```json
  {
      "status": "error",
      "message": "Data Paket Treatment tidak ditemukan"
  }
  ```

---

### 5. Perbarui Data Paket Treatment (`update`)
Melakukan pembaruan data paket treatment. Menggunakan parameter `sometimes` sehingga Anda bisa memperbarui data tertentu saja secara fleksibel.
* **Method**: `PUT` *(atau `PATCH`)*
* **URL**: `{{base_url}}/paket-treatment/{id}` *(Ganti `{id}` dengan ID yang ingin diubah, contoh: `{{base_url}}/paket-treatment/1`)*
* **Authorization**: `Bearer Token`
* **Body** (`raw` -> `JSON`):
  ```json
  {
      "Nama_paket": "Paket Glowing Wedding Exclusive",
      "Harga_paket": 1500000,
      "treatments": [
          {
              "treatment_id": 1,
              "Jumlah": 6
          }
      ]
  }
  ```
* **Respon Sukses yang Diharapkan (200 OK)**:
  ```json
  {
      "status": "success",
      "message": "Data Paket Treatment berhasil diperbarui",
      "data": {
          "id": 1,
          "Kode_paket": "PTR-001",
          "Nama_paket": "Paket Glowing Wedding Exclusive",
          "Deskripsi": "Paket perawatan khusus pranikah untuk hasil maksimal",
          "Harga_paket": 1500000,
          "treatments": [
              {
                  "id": 1,
                  "Kode_treatment": "TRT-001",
                  "Nama_treatment": "Facial Glowing Premium",
                  "Harga": 250000,
                  "pivot": {
                      "paket_treatment_id": 1,
                      "treatment_id": 1,
                      "Jumlah": 6
                  }
              }
          ]
      }
  }
  ```

---

### 6. Hapus Data Paket Treatment (`destroy`)
* **Method**: `DELETE`
* **URL**: `{{base_url}}/paket-treatment/{id}` *(Ganti `{id}` dengan ID paket yang ingin dihapus)*
* **Authorization**: `Bearer Token`
* **Respon Sukses yang Diharapkan (200 OK)**:
  ```json
  {
      "status": "success",
      "message": "Data Paket Treatment berhasil dihapus"
  }
  ```

---

## 🛠️ Panduan Pengujian Kasus Negatif (Negative Testing) untuk QA

Berikut adalah pengujian skenario error untuk memastikan keamanan dan stabilitas API:

1. **Akses Tanpa Autentikasi**: Panggil API tanpa header `Bearer Token`.  
   * *Ekspektasi*: Status **`401 Unauthorized`**.
2. **Tanpa Menyertakan Treatment**: Coba buat paket baru dengan array `treatments` kosong (`[]`) atau tidak menyertakannya sama sekali.  
   * *Ekspektasi*: Status **`422 Unprocessable Content`** dengan pesan error `"Minimal satu treatment harus ditambahkan."`.
3. **Menggunakan `treatment_id` yang Tidak Valid**: Kirim data dengan `treatment_id` bernilai `99999` (ID tidak ada di database).  
   * *Ekspektasi*: Status **`422 Unprocessable Content`** dengan pesan error `"Treatment yang dipilih tidak valid."`.
4. **Jumlah Treatment Kurang dari 1**: Kirim data dengan `Jumlah` bernilai `0` atau `-1`.  
   * *Ekspektasi*: Status **`422 Unprocessable Content`** dengan pesan error `"Jumlah treatment minimal 1."`.
5. **Mencari/Menghapus ID Paket yang Tidak Terdaftar**: Coba akses `GET /api/paket-treatment/9999` atau `DELETE /api/paket-treatment/9999`.  
   * *Ekspektasi*: Status **`404 Not Found`** dengan pesan `"Data Paket Treatment tidak ditemukan"`.
