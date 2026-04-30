/**
 * shiftConfig.js
 * Single source of truth untuk konfigurasi shift seluruh karyawan.
 * Digunakan oleh AttendancePage dan FaceScanModal untuk deteksi keterlambatan & lembur.
 */

// ─── Grup Divisi ─────────────────────────────────────────────────────────────
// Divisi pelayanan: mengikuti jam shift pelayanan (pagi/siang)
export const DIVISI_PELAYANAN = ['Dokter', 'Customer Service', 'CS', 'Perawat', 'Treatment'];
// Divisi satpam: shift pagi atau malam
export const DIVISI_SATPAM = ['Satpam', 'Security'];
// Divisi OB: shift normal atau lembur
export const DIVISI_OB = ['OB', 'Office Boy', 'Kebersihan'];

// ─── Definisi Semua Shift ─────────────────────────────────────────────────────
export const SHIFTS = {
    // Karyawan Pelayanan (CS, Dokter, Perawat, Treatment)
    pelayanan_pagi:        { label: 'Pagi',          checkIn: '08:45', checkOut: '17:00' },
    pelayanan_siang:       { label: 'Siang',         checkIn: '10:30', checkOut: '19:00' },
    pelayanan_pagi_rmdn:   { label: 'Pagi (Ramadhan)',  checkIn: '07:30', checkOut: '16:00' },
    pelayanan_siang_rmdn:  { label: 'Siang (Ramadhan)', checkIn: '10:30', checkOut: '19:00' },

    // Satpam
    satpam_pagi:           { label: 'Pagi',          checkIn: '07:30', checkOut: '20:00' },
    satpam_malam:          { label: 'Malam',         checkIn: '19:30', checkOut: '07:30', overnight: true },
    satpam_pagi_rmdn:      { label: 'Pagi (Ramadhan)',  checkIn: '06:30', checkOut: '19:00' },
    satpam_malam_rmdn:     { label: 'Malam (Ramadhan)', checkIn: '18:30', checkOut: '06:30', overnight: true },

    // OB (Office Boy)
    ob_normal:             { label: 'Normal',        checkIn: '07:00', checkOut: '17:00' },
    ob_lembur:             { label: 'Lembur',        checkIn: '07:00', checkOut: '19:00' },
    ob_normal_rmdn:        { label: 'Normal (Ramadhan)',  checkIn: '06:00', checkOut: '16:00' },
    ob_lembur_rmdn:        { label: 'Lembur (Ramadhan)',  checkIn: '06:00', checkOut: '18:00' },

    // Umum (HRD, Kasir, Supervisor, Staff Gudang, dll)
    umum_normal:           { label: 'Normal',        checkIn: '08:00', checkOut: '17:00' },
    umum_normal_rmdn:      { label: 'Normal (Ramadhan)',  checkIn: '07:00', checkOut: '16:00' },
};

// ─── Opsi Shift Per Divisi (untuk dropdown di StaffFormModal) ─────────────────
export const SHIFT_OPTIONS_BY_DIVISI = {
    default_pelayanan: [
        { value: 'pelayanan_pagi',  label: 'Pagi  (08:45 – 17:00)' },
        { value: 'pelayanan_siang', label: 'Siang (10:30 – 19:00)' },
    ],
    default_satpam: [
        { value: 'satpam_pagi',  label: 'Pagi  (07:30 – 20:00)' },
        { value: 'satpam_malam', label: 'Malam (19:30 – 07:30)' },
    ],
    default_ob: [
        { value: 'ob_normal', label: 'Normal (07:00 – 17:00)' },
        { value: 'ob_lembur', label: 'Lembur (07:00 – 19:00)' },
    ],
    default_umum: [
        { value: 'umum_normal', label: 'Normal (08:00 – 17:00)' },
    ],
};

/**
 * Dapatkan opsi shift yang tersedia berdasarkan divisi karyawan.
 * @param {string} divisi - Divisi karyawan
 * @returns {Array} Array opsi { value, label }
 */
export function getShiftOptionsByDivisi(divisi) {
    if (DIVISI_PELAYANAN.includes(divisi)) return SHIFT_OPTIONS_BY_DIVISI.default_pelayanan;
    if (DIVISI_SATPAM.includes(divisi))   return SHIFT_OPTIONS_BY_DIVISI.default_satpam;
    if (DIVISI_OB.includes(divisi))       return SHIFT_OPTIONS_BY_DIVISI.default_ob;
    return SHIFT_OPTIONS_BY_DIVISI.default_umum;
}

/**
 * Dapatkan shift aktif berdasarkan shift key + mode Ramadhan.
 * Secara otomatis mengganti ke versi Ramadhan jika isRamadhan === true.
 * @param {string} shiftKey  - Key shift dari SHIFTS (misal: 'pelayanan_pagi')
 * @param {boolean} isRamadhan
 * @returns {{ label, checkIn, checkOut, overnight? }}
 */
export function getActiveShift(shiftKey, isRamadhan) {
    if (!shiftKey) return SHIFTS['umum_normal'];

    // Jika mode Ramadhan, cari versi _rmdn
    if (isRamadhan) {
        const rmdnKey = shiftKey.endsWith('_rmdn') ? shiftKey : `${shiftKey}_rmdn`;
        if (SHIFTS[rmdnKey]) return SHIFTS[rmdnKey];
    }

    // Hilangkan suffix _rmdn jika mode Ramadhan off namun kunci masih ada _rmdn
    const normalKey = shiftKey.replace('_rmdn', '');
    return SHIFTS[normalKey] || SHIFTS['umum_normal'];
}

/**
 * Konversi string jam "HH:mm" ke menit dari tengah malam.
 * @param {string} timeStr - Format "HH:mm"
 * @returns {number} Menit total
 */
export function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

/**
 * Cek apakah karyawan terlambat check-in (tanpa toleransi).
 * @param {string} actualTime     - Jam aktual absen "HH:mm"
 * @param {string} scheduledCheckIn - Jam check-in sesuai shift "HH:mm"
 * @returns {{ isLate: boolean, diffMinutes: number }}
 */
export function checkIsLate(actualTime, scheduledCheckIn) {
    const actual    = timeToMinutes(actualTime);
    const scheduled = timeToMinutes(scheduledCheckIn);
    const diff      = actual - scheduled;
    return { isLate: diff > 0, diffMinutes: Math.max(0, diff) };
}

/**
 * Cek apakah karyawan lembur (check-out melewati jadwal).
 * @param {string} actualTime      - Jam aktual absen "HH:mm"
 * @param {string} scheduledCheckOut - Jam check-out sesuai shift "HH:mm"
 * @param {boolean} overnight      - True jika shift malam (melewati tengah malam)
 * @returns {{ isOvertime: boolean, diffMinutes: number }}
 */
export function checkIsOvertime(actualTime, scheduledCheckOut, overnight = false) {
    let actual    = timeToMinutes(actualTime);
    let scheduled = timeToMinutes(scheduledCheckOut);

    // Untuk shift overnight, jika jam aktual < 12 siang berarti sudah hari berikutnya
    if (overnight && actual < 12 * 60) actual += 24 * 60;
    if (overnight && scheduled < 12 * 60) scheduled += 24 * 60;

    const diff = actual - scheduled;
    return { isOvertime: diff > 0, diffMinutes: Math.max(0, diff) };
}

/**
 * Format menit ke string yang mudah dibaca.
 * @param {number} minutes
 * @returns {string} contoh: "1 jam 30 menit" atau "45 menit"
 */
export function formatDuration(minutes) {
    if (minutes <= 0) return '0 menit';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} menit`;
    if (m === 0) return `${h} jam`;
    return `${h} jam ${m} menit`;
}

/**
 * Dapatkan default shift key berdasarkan divisi (untuk karyawan baru).
 * @param {string} divisi
 * @returns {string} shift key default
 */
export function getDefaultShiftByDivisi(divisi) {
    if (DIVISI_PELAYANAN.includes(divisi)) return 'pelayanan_pagi';
    if (DIVISI_SATPAM.includes(divisi))   return 'satpam_pagi';
    if (DIVISI_OB.includes(divisi))       return 'ob_normal';
    return 'umum_normal';
}
