# Panduan Pengujian API Transaksi (Transaction API Testing Guide)

Dokumen ini berisi panduan lengkap bagi tim QA dan Developer untuk menguji seluruh endpoint **Transaksi** pada aplikasi backend menggunakan Postman.

---

## 📌 Ketentuan & Persiapan Awal

Sebelum memulai pengujian, pastikan langkah-langkah persiapan berikut sudah dilakukan:

1. **Base URL**: Tentukan base URL backend Anda (misalnya: `http://localhost:8000/api` atau domain staging/production Anda).
2. **Headers Wajib**: Pada setiap request di Postman, tambahkan header berikut pada tab **Headers**:
   * **Key**: `Accept`  
     **Value**: `application/json`
3. **Autentikasi (Bearer Token)**:
   Seluruh endpoint transaksi dilindungi oleh middleware `auth:sanctum`. Silakan **Login** terlebih dahulu melalui endpoint `/api/login` untuk mendapatkan token akses, lalu sematkan token tersebut di tab **Authorization** -> **Bearer Token** pada request.
   * *Catatan khusus*: Jika Anda tidak menyertakan token (atau sedang testing local seadanya), sistem akan mencoba melakukan fallback ke karyawan pertama di database. Namun, sangat direkomendasikan untuk menggunakan autentikasi yang valid.

---

## ⚙️ Logika Bisnis Utama & Validasi (Core Rules)

Pahami aturan bisnis berikut untuk merancang test case yang valid maupun invalid:

| Fitur / Skenario | Aturan Bisnis | Hasil yang Diharapkan |
| :--- | :--- | :--- |
| **Shift Jam 5 Sore** | Jika transaksi dibuat setelah pukul **17:00**, `tanggal_transaksi` dan `created_at` otomatis bergeser **+1 hari**. | Tanggal transaksi di DB = `tanggal_input + 1 hari`. |
| **Batas Distributor** | Distributor (`distributor_id` terisi) **hanya boleh** membeli item bertipe `StokProduk`. | Error `422` jika memesan `Treatment` atau `StokRacikan`. |
| **Deposit Distributor** | Memotong saldo `sisa_deposit` distributor secara langsung. | Error `422` jika saldo deposit tidak mencukupi total harga. |
| **Stok Bahan Treatment** | Saat membuat transaksi `Treatment`, sistem akan mengecek ketersediaan bahan pendukung treatment tersebut. | Error `422` jika stok bahan treatment tidak mencukupi di gudang. |
| **Tipe: Treatment** | Transaksi langsung berstatus **Selesai**. No Faktur: `PB-YYMMDD2xxx`. | Stok bahan langsung berkurang saat transaksi dibuat. |
| **Tipe: Racikan** | Transaksi langsung berstatus **Selesai**. No Faktur: `PB-YYMMDD3xxx`. | Transaksi berhasil dibuat. |
| **Tipe: Produk** | Transaksi berstatus **Pending**. No Resi: `PO-YYMMDD1xxx`. No Faktur masih `null`. | Stok produk **belum** berkurang sampai disetujui (Approved) oleh Gudang. |

---

## 🧪 Skenario Pengujian Endpoint Transaksi

### 1. Menampilkan Daftar Transaksi (`index`)
Digunakan untuk melihat seluruh riwayat transaksi. Dapat difilter berdasarkan status transaksi.

* **Method**: `GET`
* **URL**: `{{base_url}}/transaksi`
* **Query Parameters** (Opsional):
  * `status`: `Pending` atau `Selesai`
* **Headers**:
  * `Authorization`: `Bearer Token`
* **Respon Sukses (200 OK)**:
  ```json
  {
      "status": "success",
      "message": "Data Transaksi berhasil ditampilkan",
      "data": [
          {
              "id": "9c67ad7f-9418-4903-8d2b-e1c02abf9b88",
              "order_id": "ORD-260619-3850",
              "tipe_transaksi": "Produk",
              "no_faktur": null,
              "no_resi": "PO-2606191001",
              "data_pasien_id": 1,
              "distributor_id": null,
              "nama_pasien_distributor": "Ahmad Rafli",
              "status": "Pending",
              "total_keseluruhan": 150000,
              "metode_pembayaran": "Tunai",
              "created_at": "2026-06-19T17:00:00.000000Z",
              "details": [
                  {
                      "id": "7bf3b965-cc86-4e5b-b9f0-c23f2f0a1c1d",
                      "transaksi_id": "9c67ad7f-9418-4903-8d2b-e1c02abf9b88",
                      "itemable_type": "App\\Models\\StokProduk",
                      "itemable_id": 12,
                      "nama_item": "Sunscreen Gel",
                      "qty": 3,
                      "harga": 50000,
                      "total_harga": 150000
                  }
              ]
          }
      ]
  }
  ```

---

### 2. Membuat Transaksi Baru (`store`)
Digunakan oleh Customer Service (CS) / MOS untuk mencatat pesanan pelanggan atau distributor.

* **Method**: `POST`
* **URL**: `{{base_url}}/transaksi`
* **Body** (`raw` -> `JSON`):

#### **Skenario A: Transaksi Produk (PO) Umum**
```json
{
    "data_pasien_id": 1,
    "nama_pasien_distributor": "Ahmad Rafli",
    "is_distributor": false,
    "alamat_pengiriman": "Jl. Dharmahusada No. 10",
    "tanggal_transaksi": "2026-06-19",
    "catatan_pesanan": "Kirim sore hari",
    "metode_pembayaran": "Tunai",
    "details": [
        {
            "item_type": "StokProduk",
            "item_id": 1,
            "qty": 2
        }
    ]
}
```

#### **Skenario B: Transaksi Distributor (Hanya Produk + Cek Deposit)**
```json
{
    "distributor_id": 2,
    "nama_pasien_distributor": "Apotek Medika",
    "alamat_pengiriman": "Jl. Raya Genteng No. 5",
    "tanggal_transaksi": "2026-06-19",
    "metode_pembayaran": "Non Tunai",
    "details": [
        {
            "item_type": "StokProduk",
            "item_id": 1,
            "qty": 10
        }
    ]
}
```

#### **Skenario C: Transaksi Treatment (Langsung Mengurangi Stok Bahan)**
```json
{
    "data_pasien_id": 1,
    "nama_pasien_distributor": "Ahmad Rafli",
    "tanggal_transaksi": "2026-06-19",
    "metode_pembayaran": "Tunai",
    "details": [
        {
            "item_type": "Treatment",
            "item_id": 3,
            "qty": 1
        }
    ]
}
```

#### **Skenario D: Transaksi Gabungan (Produk + Treatment)**
Skenario ini terjadi jika pelanggan membeli produk ritel sekaligus melakukan treatment kecantikan. Sistem akan membagi pemesanan ini menjadi **dua baris transaksi terpisah** di database: satu bertipe `Treatment` berstatus `Selesai` (untuk langsung mengurangi bahan), dan satu bertipe `Produk` berstatus `Pending`. Kedua transaksi tersebut akan memiliki `order_id` yang sama untuk memudahkan pelacakan.

```json
{
    "data_pasien_id": 1,
    "nama_pasien_distributor": "Ahmad Rafli",
    "tanggal_transaksi": "2026-06-19",
    "metode_pembayaran": "Tunai",
    "details": [
        {
            "item_type": "StokProduk",
            "item_id": 1,
            "qty": 2
        },
        {
            "item_type": "Treatment",
            "item_id": 3,
            "qty": 1
        }
    ]
}
```

* **Respon Sukses Pembuatan Transaksi Gabungan (201 Created)**:
  ```json
  {
      "status": "success",
      "message": "Transaksi berhasil dibuat",
      "data": [
          {
              "id": "e6717a6c-95b1-4f38-bc4a-d68a9adab921",
              "order_id": "ORD-260619-7721",
              "tipe_transaksi": "Treatment",
              "no_faktur": "PB-2606192001",
              "no_resi": null,
              "status": "Selesai",
              "total_keseluruhan": 250000,
              "details": [...]
          },
          {
              "id": "a117b8ef-51a8-4444-bc8b-f481ad124a9d",
              "order_id": "ORD-260619-7721",
              "tipe_transaksi": "Produk",
              "no_faktur": null,
              "no_resi": "PO-2606191001",
              "status": "Pending",
              "total_keseluruhan": 100000,
              "details": [...]
          }
      ]
  }
  ```

#### **Parameter Body:**
| Field | Type | Required | Keterangan / Validasi |
| :--- | :--- | :--- | :--- |
| `data_pasien_id` | Integer | Opsional | ID Pasien dari tabel `data_pasiens`. |
| `distributor_id` | Integer | Opsional | ID Distributor dari tabel `distributors`. |
| `nama_pasien_distributor` | String | **Ya** | Nama pasien atau nama distributor. |
| `is_distributor` | Boolean | Opsional | Set `true` jika dibeli oleh distributor. |
| `alamat_pengiriman` | String | Opsional | Alamat tujuan pengiriman produk. |
| `tanggal_transaksi` | Date | **Ya** | Format `YYYY-MM-DD`. Terkena aturan shift jam 5 sore. |
| `catatan_pesanan` | String | Opsional | Catatan tambahan (maks 100 karakter). |
| `metode_pembayaran` | String | Opsional | Pilihan: `Tunai`, `Non Tunai`. |
| `details` | Array | **Ya** | Array berisi item yang dibeli (min: 1). |
| `details.*.item_type` | String | **Ya** | Pilihan: `StokProduk`, `Treatment`, `StokRacikan`. |
| `details.*.item_id` | Integer | **Ya** | ID item yang bersangkutan di database. |
| `details.*.qty` | Integer | **Ya** | Jumlah kuantitas pembelian (min: 1). |

* **Respon Sukses Pembuatan (201 Created)**:
  ```json
  {
      "status": "success",
      "message": "Transaksi berhasil dibuat",
      "data": [
          {
              "id": "e6717a6c-95b1-4f38-bc4a-d68a9adab921",
              "order_id": "ORD-260619-4509",
              "tipe_transaksi": "Produk",
              "no_faktur": null,
              "no_resi": "PO-2606191002",
              "status": "Pending",
              "total_keseluruhan": 100000,
              "details": [...]
          }
      ]
  }
  ```

* **Respon Gagal - Validasi Input (422 Unprocessable Content)**:
  Contoh jika distributor membeli treatment/racikan:
  ```json
  {
      "status": "error",
      "errors": {
          "details": [
              "Distributor hanya diperbolehkan membeli produk (StokProduk)."
          ]
      }
  }
  ```

* **Respon Gagal - Saldo Deposit Distributor Tidak Cukup (422 Unprocessable Content)**:
  ```json
  {
      "status": "error",
      "errors": {
          "distributor_id": [
              "Saldo deposit distributor tidak mencukupi. Sisa deposit saat ini: Rp 50.000"
          ]
      }
  }
  ```

* **Respon Gagal - Stok Bahan Treatment Tidak Cukup (422 Unprocessable Content)**:
  ```json
  {
      "status": "error",
      "errors": {
          "details": [
              "Stok bahan 'Cairan Infus' tidak mencukupi untuk melakukan treatment 'Infus Vitamin C'. Dibutuhkan: 2, Tersedia: 1."
          ]
      }
  }
  ```

---

### 3. Detail Transaksi (`show`)
Digunakan untuk melihat detail satu transaksi spesifik beserta relasi Pasien, Karyawan, dan Item Detail.

* **Method**: `GET`
* **URL**: `{{base_url}}/transaksi/{id}`
* **Headers**:
  * `Authorization`: `Bearer Token`
* **Respon Sukses (200 OK)**:
  ```json
  {
      "status": "success",
      "data": {
          "id": "9c67ad7f-9418-4903-8d2b-e1c02abf9b88",
          "order_id": "ORD-260619-3850",
          "tipe_transaksi": "Produk",
          "no_resi": "PO-2606191001",
          "status": "Pending",
          "total_keseluruhan": 150000,
          "pasien": { "id": 1, "Nama_pasien": "Ahmad Rafli" },
          "karyawan": { "id": 5, "NamaLengkap_karyawan": "Siti Aminah" },
          "details": [...]
      }
  }
  ```
* **Respon Gagal - Tidak Ditemukan (404 Not Found)**:
  ```json
  {
      "status": "error",
      "message": "Data Transaksi tidak ditemukan"
  }
  ```

---

### 4. Memperbarui Transaksi (`update`)
Digunakan oleh tim Gudang atau Admin untuk mengedit detail item transaksi yang **belum berstatus Selesai**.

* **Method**: `PUT`
* **URL**: `{{base_url}}/transaksi/{id}`
* **Body** (`raw` -> `JSON`):
  ```json
  {
      "details": [
          {
              "item_type": "StokProduk",
              "item_id": 1,
              "qty": 5
          }
      ]
  }
  ```
  *(Catatan: Rute update ini hanya memperbolehkan `item_type` berupa `StokProduk` atau `Treatment`)*

* **Respon Sukses (200 OK)**:
  ```json
  {
      "status": "success",
      "message": "Data Transaksi berhasil diperbarui",
      "data": {
          "id": "9c67ad7f-9418-4903-8d2b-e1c02abf9b88",
          "total_keseluruhan": 250000,
          "details": [...]
      }
  }
  ```
* **Respon Gagal - Transaksi Sudah Selesai (403 Forbidden)**:
  ```json
  {
      "status": "error",
      "message": "Transaksi sudah Selesai and tidak bisa diedit"
  }
  ```

---

### 5. Menyetujui & Menyelesaikan Transaksi (`approve`)
Rute khusus untuk tim Gudang saat menyerahkan/mengirim barang. Proses ini akan mengubah status transaksi menjadi `Selesai`, men-generate No Faktur (`PB-YYMMDD1xxx`), dan **mengurangi stok produk secara riil**.

* **Method**: `POST`
* **URL**: `{{base_url}}/transaksi/{id}/approve`
* **Body** (`raw` -> `JSON` - Opsional):
  Anda dapat mengirimkan perubahan kuantitas terbaru jika ada barang yang berkurang saat verifikasi fisik di gudang:
  ```json
  {
      "alamat_pengiriman": "Jl. Raya Baru No. 12",
      "details": [
          {
              "id": "7bf3b965-cc86-4e5b-b9f0-c23f2f0a1c1d",
              "qty": 2,
              "subtotal": 100000
          }
      ]
  }
  ```

* **Respon Sukses (200 OK)**:
  ```json
  {
      "status": "success",
      "message": "Transaksi berhasil diselesaikan. No Faktur di-generate dan stok telah dikurangi.",
      "data": {
          "id": "9c67ad7f-9418-4903-8d2b-e1c02abf9b88",
          "no_faktur": "PB-2606191001",
          "status": "Selesai",
          "total_keseluruhan": 100000,
          "details": [...]
      }
  }
  ```
* **Respon Gagal - Sudah Disetujui Sebelumnya (400 Bad Request)**:
  ```json
  {
      "status": "error",
      "message": "Transaksi ini sudah diselesaikan sebelumnya."
  }
  ```
