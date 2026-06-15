# Panduan Pengujian API Distributor (Distributor API Testing Guide)

Dokumen ini berisi panduan lengkap bagi tim QA untuk menguji seluruh endpoint **Distributor & Deposit** pada aplikasi backend menggunakan Postman.

---

## 📌 Ketentuan & Persiapan Awal

Sebelum memulai pengujian, pastikan langkah-langkah persiapan berikut sudah dilakukan:

1. **Base URL**: Tentukan base URL backend Anda (misalnya: `http://localhost:8000/api` atau domain staging/production Anda).
2. **Headers Wajib**: Pada setiap request di Postman, tambahkan header berikut pada tab **Headers**:
   * **Key**: `Accept`  
     **Value**: `application/json`
3. **Autentikasi (Bearer Token)**:
   Seluruh endpoint Distributor dilindungi oleh middleware `auth:sanctum`. Silakan **Login** terlebih dahulu melalui endpoint `/api/login` untuk mendapatkan token akses, lalu sematkan token tersebut di tab **Authorization** -> **Bearer Token** pada setiap request berikutnya.

---

## 🧪 Pengujian Endpoint Distributor

---

### 1. Tampilkan Semua Distributor (`index`)
Menampilkan seluruh data distributor yang terdaftar beserta saldo deposit mereka.

* **Method**: `GET`
* **URL**: `{{base_url}}/distributor`
* **Authorization**: `Bearer Token`
* **Respon Sukses yang Diharapkan (200 OK)**:
  ```json
  {
      "message": "Data distributor berhasil diambil.",
      "data": [
          {
              "id": "99db6c0e-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
              "Nama_Distributor": "PT. Medika Jaya",
              "Tanggal_Lahir": "1990-01-01",
              "Alamat": "Jl. Raya Jember No. 123",
              "No_Telp": "081234567890",
              "Email": "info@medikajaya.com",
              "Sisa_Deposit": 5000000
          }
      ]
  }
  ```

---

### 2. Tampilkan Detail Distributor Berdasarkan ID (`show`)
* **Method**: `GET`
* **URL**: `{{base_url}}/distributor/{id}` *(Ganti `{id}` dengan ID distributor yang valid)*
* **Authorization**: `Bearer Token`

---

### 3. Tambah Distributor Baru (`store`)
Menambahkan data distributor baru beserta saldo deposit awal (`deposit_masuk`).

* **Method**: `POST`
* **URL**: `{{base_url}}/distributor`
* **Authorization**: `Bearer Token`
* **Headers**:
  * `Content-Type`: `application/json`
* **Body** (`raw` -> `JSON`):
  ```json
  {
      "nama_distributor": "PT. Sentosa Abadi",
      "tanggal_lahir": "1988-08-18",
      "alamat": "Jl. Gajah Mada No. 45, Jember",
      "no_telp": "089876543210",
      "email": "contact@sentosaabadi.com",
      "distributor": "Utama",
      "deposit_masuk": 10000000
  }
  ```

| Field | Type | Required | Keterangan / Validasi |
| :--- | :--- | :--- | :--- |
| `nama_distributor` | String | **Ya** | Nama distributor (maksimal 255 karakter) |
| `tanggal_lahir` | Date | **Ya** | Tanggal lahir/berdiri (Format: `YYYY-MM-DD`) |
| `alamat` | String | **Ya** | Alamat lengkap (maksimal 255 karakter) |
| `no_telp` | String/Numeric | **Ya** | Nomor telepon (angka saja, panjang 10-13 digit) |
| `email` | String | **Ya** | Alamat email valid |
| `distributor` | String | **Ya** | Kategori/tipe distributor (maksimal 20 karakter) |
| `deposit_masuk` | Numeric | **Ya** | Jumlah saldo deposit awal yang disetor |

* **Respon Sukses yang Diharapkan (201 Created)**:
  ```json
  {
      "message": "Berhasil, Data Distributor berhasil ditambahkan",
      "data": {
          "id": "uuid-baru-distributor",
          "nama_distributor": "PT. Sentosa Abadi",
          "sisa_deposit": 10000000,
          ...
      }
  }
  ```

---

### 4. Perbarui Data Distributor (`update`)
Memperbarui data distributor yang sudah ada.

* **Method**: `PUT`
* **URL**: `{{base_url}}/distributor/{id}` *(Ganti `{id}` dengan ID distributor)*
* **Authorization**: `Bearer Token`
* **Headers**:
  * `Content-Type`: `application/json`
* **Body** (`raw` -> `JSON`):
  ```json
  {
      "nama_distributor": "PT. Sentosa Abadi Perkasa",
      "tanggal_lahir": "1988-08-18",
      "alamat": "Jl. Gajah Mada No. 99, Jember",
      "no_telp": "089876543210",
      "email": "sales@sentosaabadi.com",
      "distributor": "Utama",
      "deposit_masuk": 12000000
  }
  ```

* **Respon Sukses (200 OK)**:
  ```json
  {
      "message": "Berhasil, Data Distributor berhasil ditambahkan",
      "data": {
          "id": "uuid-distributor",
          "nama_distributor": "PT. Sentosa Abadi Perkasa",
          ...
      }
  }
  ```

---

### 5. Tambah/Top-Up Deposit Distributor (`addDeposit`)
Menambahkan sejumlah dana untuk menambah saldo deposit distributor saat ini.

* **Method**: `PUT`
* **URL**: `{{base_url}}/distributor/{id}/deposit` *(Ganti `{id}` dengan ID distributor)*
* **Authorization**: `Bearer Token`
* **Headers**:
  * `Content-Type`: `application/json`
* **Body** (`raw` -> `JSON`):
  ```json
  {
      "deposit_masuk": 2500000
  }
  ```

| Field | Type | Required | Keterangan / Validasi |
| :--- | :--- | :--- | :--- |
| `deposit_masuk` | Numeric | **Ya** | Jumlah nominal deposit tambahan (minimal 0) |

* **Respon Sukses yang Diharapkan (200 OK)**:
  ```json
  {
      "message": "Berhasil, Deposit berhasil ditambahkan",
      "data": {
          "id": "uuid-distributor",
          "Nama_Distributor": "PT. Sentosa Abadi Perkasa",
          "Sisa_Deposit": 14500000
      }
  }
  ```
