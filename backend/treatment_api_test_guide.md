# Panduan Pengujian API Treatment (Treatment API Testing Guide)

Dokumen ini berisi panduan lengkap bagi tim QA untuk menguji seluruh endpoint **Treatment** pada aplikasi backend menggunakan Postman.

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
   Karena seluruh endpoint Treatment dilindungi oleh middleware `auth:sanctum`, Anda harus **Login** terlebih dahulu untuk mendapatkan token akses, kemudian sematkan token tersebut di tab **Authorization** -> **Bearer Token** pada setiap request berikutnya.

---

## 🔑 Langkah 1: Login & Dapatkan Token Akses

* **Method**: `POST`
* **URL**: `{{base_url}}/login`
* **Headers**:
  * `Accept`: `application/json`
* **Body** (`raw` -> `JSON`):
  ```json
  {
      "email": "admin@example.com",
      "password": "password_anda"
  }
  ```
* **Langkah Tindak Lanjut**:
  1. Salin nilai token dari respon JSON (misalnya: `1|abcdef12345...`).
  2. Buka request Treatment berikutnya di Postman.
  3. Masuk ke tab **Authorization**, pilih **Bearer Token**, lalu tempel (paste) token tersebut ke dalam kolom **Token**.

---

## 🧪 Langkah 2: Pengujian Endpoint Treatment

### 1. Dapatkan Preview Kode Treatment Berikutnya (`getNextNumber`)
Digunakan untuk melihat kode treatment otomatis terbaru yang akan dihasilkan oleh sistem (misalnya: `TRT-001`).
* **Method**: `GET`
* **URL**: `{{base_url}}/treatment/next-number`
* **Authorization**: `Bearer Token`
* **Respon Sukses yang Diharapkan (200 OK)**:
  ```json
  {
      "status": "success",
      "Kode_treatment": "TRT-001"
  }
  ```

---

### 2. Tambah Data Treatment Baru (`store`)
Menambahkan treatment baru beserta daftar bahan baku/obat yang digunakan selama treatment.
* **Method**: `POST`
* **URL**: `{{base_url}}/treatment`
* **Authorization**: `Bearer Token`
* **Body** (`raw` -> `JSON`):
  ```json
  {
      "Nama_treatment": "Facial Glowing Premium",
      "Kategori": "Facial",
      "Harga": 250000,
      "bahan": [
          {
              "bahan_id": 1,
              "bahan_type": "StokBahanTreatment", 
              "Jumlah": 2
          },
          {
              "bahan_id": 3,
              "bahan_type": "StokProduk", 
              "Jumlah": 1
          }
      ]
  }
  ```
* **Aturan Khusus QA (Validasi `bahan_type`)**:
  Nilai `bahan_type` wajib berupa salah satu dari tipe berikut:
  * `StokProduk`
  * `StokBarangApotek`
  * `StokBahanTreatment`
  * `StokBahanMedis`
  * `StokBahanInfus`

* **Respon Sukses yang Diharapkan (201 Created)**:
  ```json
  {
      "status": "success",
      "message": "Data Treatment berhasil ditambahkan",
      "data": {
          "id": 1,
          "Kode_treatment": "TRT-001",
          "Nama_treatment": "Facial Glowing Premium",
          "Kategori": "Facial",
          "Harga": 250000,
          "bahan": [
              {
                  "id": 1,
                  "treatment_id": 1,
                  "bahan_id": 1,
                  "bahan_type": "App\\Models\\StokBahanTreatment",
                  "Jumlah": 2
              },
              {
                  "id": 2,
                  "treatment_id": 1,
                  "bahan_id": 3,
                  "bahan_type": "App\\Models\\StokProduk",
                  "Jumlah": 1
              }
          ]
      }
  }
  ```

---

### 3. Tampilkan Seluruh Data Treatment (`index`)
* **Method**: `GET`
* **URL**: `{{base_url}}/treatment`
* **Authorization**: `Bearer Token`
* **Respon Sukses yang Diharapkan (200 OK)**: Menampilkan seluruh data treatment yang tersimpan beserta relasi bahannya.

---

### 4. Tampilkan Detail Treatment Berdasarkan ID (`show`)
* **Method**: `GET`
* **URL**: `{{base_url}}/treatment/{id}` *(Ganti `{id}` dengan ID treatment yang valid, contoh: `{{base_url}}/treatment/1`)*
* **Authorization**: `Bearer Token`
* **Respon Sukses yang Diharapkan (200 OK)**: Menampilkan satu objek treatment lengkap beserta daftar bahan terkait.
* **Respon Error jika ID tidak ditemukan (404 Not Found)**:
  ```json
  {
      "status": "error",
      "message": "Data Treatment tidak ditemukan"
  }
  ```

---

### 5. Perbarui Data Treatment (`update`)
Melakukan pembaruan data treatment. Karena validasi bersifat dinamis (`sometimes`), Anda dapat mengirimkan sebagian field saja atau memperbarui seluruh datanya.
* **Method**: `PUT` *(atau `PATCH`)*
* **URL**: `{{base_url}}/treatment/{id}` *(Ganti `{id}` dengan ID yang ingin diubah, contoh: `{{base_url}}/treatment/1`)*
* **Authorization**: `Bearer Token`
* **Body** (`raw` -> `JSON`):
  ```json
  {
      "Nama_treatment": "Facial Glowing Premium Super",
      "Harga": 275000,
      "bahan": [
          {
              "bahan_id": 1,
              "bahan_type": "StokBahanTreatment",
              "Jumlah": 3
          }
      ]
  }
  ```
* **Respon Sukses yang Diharapkan (200 OK)**:
  ```json
  {
      "status": "success",
      "message": "Data Treatment berhasil diperbarui",
      "data": {
          "id": 1,
          "Kode_treatment": "TRT-001",
          "Nama_treatment": "Facial Glowing Premium Super",
          "Kategori": "Facial",
          "Harga": 275000,
          "bahan": [
              {
                  "id": 3,
                  "treatment_id": 1,
                  "bahan_id": 1,
                  "bahan_type": "App\\Models\\StokBahanTreatment",
                  "Jumlah": 3
              }
          ]
      }
  }
  ```

---

### 6. Hapus Data Treatment (`destroy`)
Menghapus data treatment dari sistem.
* **Method**: `DELETE`
* **URL**: `{{base_url}}/treatment/{id}` *(Ganti `{id}` dengan ID yang ingin dihapus)*
* **Authorization**: `Bearer Token`
* **Respon Sukses yang Diharapkan (200 OK)**:
  ```json
  {
      "status": "success",
      "message": "Data Treatment berhasil dihapus"
  }
  ```

---

## 🛠️ Panduan Pengujian Kasus Negatif (Negative Testing) untuk QA

Untuk memastikan kestabilan API, lakukan pengujian kasus berikut:

1. **Akses Tanpa Token**: Panggil API tanpa menyertakan `Bearer Token`.  
   * *Ekspektasi*: Status **`401 Unauthorized`**.
2. **Format Data Tidak Sesuai**: Kirim parameter `Harga` berupa string ("gratis") atau field `bahan` bukan berupa array.  
   * *Ekspektasi*: Status **`422 Unprocessable Content`** beserta penjelasan error spesifik pada field tersebut.
3. **Pilihan `bahan_type` Salah**: Kirim data bahan dengan `bahan_type` bernilai "ObatKecantikan" (tidak terdaftar).  
   * *Ekspektasi*: Status **`422 Unprocessable Content`** karena tidak masuk dalam whitelist (`StokProduk`, `StokBarangApotek`, `StokBahanTreatment`, `StokBahanMedis`, `StokBahanInfus`).
4. **ID Tidak Terdaftar**: Coba panggil method `GET /treatment/9999` atau `DELETE /treatment/9999`.  
   * *Ekspektasi*: Status **`404 Not Found`** dengan pesan `"Data Treatment tidak ditemukan"`.
