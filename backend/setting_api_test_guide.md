# Panduan Pengujian API Pengaturan Sistem (Settings API Testing Guide)

Dokumen ini berisi panduan lengkap bagi tim QA untuk menguji seluruh endpoint **Pengaturan Sistem** (seperti Mode Ramadhan) pada aplikasi backend menggunakan Postman.

---

## 📌 Ketentuan & Persiapan Awal

Sebelum memulai pengujian, pastikan langkah-langkah persiapan berikut sudah dilakukan:

1. **Base URL**: Tentukan base URL backend Anda (misalnya: `http://localhost:8000/api` atau domain staging/production Anda).
2. **Headers Wajib**: Pada setiap request di Postman, tambahkan header berikut pada tab **Headers**:
   * **Key**: `Accept`  
     **Value**: `application/json`
3. **Autentikasi (Bearer Token)**:
   Endpoint Pengaturan Sistem dilindungi oleh middleware `auth:sanctum`. Silakan **Login** terlebih dahulu melalui endpoint `/api/login` untuk mendapatkan token akses, lalu sematkan token tersebut di tab **Authorization** -> **Bearer Token** pada request.
   * *Catatan khusus*: Rute pengaturan sistem ini hanya bisa diakses oleh akun karyawan yang memiliki divisi **HRD**, **Owner**, atau **Super Admin**.

---

## 🧪 Pengujian Endpoint Pengaturan Sistem

---

### 1. Memperbarui Status Mode Ramadhan (`updateModeRamadhan`)
Digunakan untuk mengaktifkan atau menonaktifkan Mode Ramadhan pada sistem absensi. Mode Ramadhan ini secara otomatis akan menyesuaikan jadwal masuk & pulang kerja shift karyawan menjadi lebih awal sesuai konfigurasi shift Ramadhan.

* **Method**: `POST`
* **URL**: `{{base_url}}/settings/mode-ramadhan`
* **Authorization**: `Bearer Token` *(Wajib HRD / Owner / Super Admin)*
* **Headers**:
  * `Content-Type`: `application/json`
* **Body** (`raw` -> `JSON`):

**Contoh 1: Mengaktifkan Mode Ramadhan**
```json
{
    "is_active": true
}
```

**Contoh 2: Menonaktifkan Mode Ramadhan**
```json
{
    "is_active": false
}
```

| Field | Type | Required | Keterangan / Validasi |
| :--- | :--- | :--- | :--- |
| `is_active` | Boolean | **Ya** | Tentukan `true` untuk mengaktifkan (nilai data di DB menjadi `'1'`) atau `false` untuk menonaktifkan (nilai data di DB menjadi `'0'`). |

* **Respon Sukses yang Diharapkan (200 OK)**:
  ```json
  {
      "message": "Mode Ramadhan berhasil diperbarui.",
      "mode_ramadhan": true
  }
  ```
* **Respon Gagal - Akses Ditolak / Bukan HRD/Owner/Admin (403 Forbidden)**:
  ```json
  {
      "message": "Akses ditolak! Fitur ini hanya untuk divisi HRD, Owner, atau Super Admin."
  }
  ```
* **Respon Gagal Validasi (422 Unprocessable Content)**:
  ```json
  {
      "message": "The is active field is required.",
      "errors": {
          "is_active": [
              "The is active field is required."
          ]
      }
  }
  ```
