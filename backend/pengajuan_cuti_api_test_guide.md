# Panduan Pengujian API Pengajuan Cuti (Pengajuan Cuti API Testing Guide)

Dokumen ini berisi panduan lengkap bagi tim QA untuk menguji seluruh endpoint **Pengajuan Cuti** pada aplikasi backend menggunakan Postman.

---

## 📌 Ketentuan & Persiapan Awal

Sebelum memulai pengujian, pastikan langkah-langkah persiapan berikut sudah dilakukan:

1. **Base URL**: Tentukan base URL backend Anda (misalnya: `http://localhost:8000/api` atau domain staging/production Anda).
2. **Headers Wajib**: Pada setiap request di Postman, tambahkan header berikut pada tab **Headers**:
   * **Key**: `Accept`  
     **Value**: `application/json`
3. **Autentikasi (Bearer Token)**:
   Seluruh endpoint Pengajuan Cuti dilindungi oleh middleware `auth:sanctum`. Silakan **Login** terlebih dahulu melalui endpoint `/api/login` untuk mendapatkan token akses, lalu sematkan token tersebut di tab **Authorization** -> **Bearer Token** pada setiap request berikutnya.
   * *Catatan khusus*: Rute pengajuan cuti (`store`) dapat diakses oleh **semua karyawan**, namun rute daftar, detail, dan review hanya bisa diakses oleh **HRD**, **Owner**, atau **Super Admin**.

---

## 🧪 Pengujian Endpoint Pengajuan Cuti

---

### 1. Buat Pengajuan Cuti Baru (`store`)
Digunakan oleh karyawan untuk mengajukan cuti (Tahunan, Cuti Khusus, atau Cuti Sakit).

* **Method**: `POST`
* **URL**: `{{base_url}}/pengajuan-cuti`
* **Authorization**: `Bearer Token` *(Token Karyawan)*
* **Headers**:
  * `Content-Type`: `application/json`
* **Body** (`raw` -> `JSON`):

**Contoh 1: Cuti Umum / Libur Biasa**
```json
{
    "jenis_cuti": "CUTI",
    "tanggal_mulai": "2026-06-20",
    "tanggal_selesai": "2026-06-22",
    "alasan": "Ada acara pernikahan keluarga dekat"
}
```

**Contoh 2: Cuti Sakit (Wajib menyertakan bukti berupa teks/base64)**
```json
{
    "jenis_cuti": "SAKIT",
    "tanggal_mulai": "2026-06-23",
    "tanggal_selesai": "2026-06-24",
    "alasan": "Demam tinggi dan disarankan bed rest oleh dokter",
    "gambar_bukti_cuti": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD..."
}
```

| Field | Type | Required | Keterangan / Validasi |
| :--- | :--- | :--- | :--- |
| `jenis_cuti` | String | **Ya** | Jenis cuti (contoh: `"CUTI"`, `"SAKIT"`) |
| `tanggal_mulai` | Date | **Ya** | Tanggal mulai cuti (Format: `YYYY-MM-DD`) |
| `tanggal_selesai` | Date | **Ya** | Tanggal selesai cuti (Format: `YYYY-MM-DD`) |
| `alasan` | String | **Ya** | Alasan detail pengajuan cuti |
| `gambar_bukti_cuti` | String | **Kondisional** | **Wajib diisi jika `jenis_cuti` = `"SAKIT"`**. Bisa diisi dengan string base64 surat keterangan dokter atau nama file bukti. |

---

### 2. Tampilkan Semua Pengajuan Cuti (`index`)
Menampilkan data seluruh pengajuan cuti dengan paginasi (10 data per halaman).

* **Method**: `GET`
* **URL**: `{{base_url}}/pengajuan-cuti`
* **Authorization**: `Bearer Token` *(Wajib HRD / Owner / Super Admin)*
* **Params** (Query Params - Opsional):
  * `status`: `PENDING` / `DISETUJUI` / `DITOLAK` (Filter berdasarkan status pengajuan)

* **Respon Sukses (200 OK)**:
  ```json
  {
      "message": "Data pengajuan cuti berhasil diambil",
      "data": {
          "current_page": 1,
          "data": [
              {
                  "id": 1,
                  "Nama_Karyawan": "Dr. Budi Utomo",
                  "Jenis_Cuti": "CUTI",
                  "Tanggal_Mulai": "2026-06-20",
                  "Tanggal_Selesai": "2026-06-22",
                  "Status_pengajuan": "PENDING",
                  "Alasan": "Ada acara pernikahan keluarga dekat"
              }
          ],
          ...
      }
  }
  ```

---

### 3. Tampilkan Detail Pengajuan Cuti (`show`)
Menampilkan detail pengajuan cuti beserta informasi bukti cuti jika jenis cutinya sakit.

* **Method**: `GET`
* **URL**: `{{base_url}}/pengajuan-cuti/{id}` *(Ganti `{id}` dengan ID pengajuan cuti)*
* **Authorization**: `Bearer Token` *(Wajib HRD / Owner / Super Admin)*

---

### 4. Review (Setujui atau Tolak) Pengajuan Cuti (`review`)
Menyetujui atau menolak permohonan cuti.
> 💡 **Info Otomatisasi Absensi**: Jika status diubah menjadi **`DISETUJUI`**, sistem akan otomatis membuat/memperbarui record absensi dengan status **"Cuti"** / **"Sakit"** untuk karyawan pada seluruh rentang tanggal pengajuan cuti tersebut secara otomatis.

* **Method**: `POST`
* **URL**: `{{base_url}}/pengajuan-cuti/{id}/review` *(Ganti `{id}` dengan ID pengajuan cuti)*
* **Authorization**: `Bearer Token` *(Wajib HRD / Owner / Super Admin)*
* **Headers**:
  * `Content-Type`: `application/json`
* **Body** (`raw` -> `JSON`):
  ```json
  {
      "status_pengajuan": "DISETUJUI"
  }
  ```
  *(Isian untuk `"status_pengajuan"` hanya diperbolehkan bernilai `"DISETUJUI"` atau `"DITOLAK"`)*

* **Respon Sukses - DISETUJUI (200 OK)**:
  ```json
  {
      "message": "Berhasil, Pengajuan cuti disetujui."
  }
  ```
* **Respon Sukses - DITOLAK (200 OK)**:
  ```json
  {
      "message": "Pengajuan cuti ditolak."
  }
  ```
