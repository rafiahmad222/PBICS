import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, MapPin, AlertTriangle, MessageSquare, Send } from 'lucide-react';
import { formatDuration } from '../../utils/shiftConfig';

/**
 * OvertimeNoteModal
 * Muncul otomatis setelah karyawan berhasil scan wajah,
 * jika terdeteksi terlambat, lembur, atau absen di luar kantor.
 * Karyawan wajib mengisi notes/alasan sebelum submit ke HRD.
 */
const OvertimeNoteModal = ({ isOpen, onClose, onSubmit, anomalyData, employeeName }) => {
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    if (!isOpen || !anomalyData) return null;

    const { isLate, isOvertime, isOutside, detectedTime, shift, diffMinutes, type } = anomalyData;

    // Tentukan jenis anomali (bisa lebih dari 1, prioritas: lembur > luar kantor > terlambat)
    const anomalyTypes = [];
    if (isLate)     anomalyTypes.push('Terlambat');
    if (isOvertime) anomalyTypes.push('Lembur');
    if (isOutside)  anomalyTypes.push('Luar Kantor');
    const primaryType = isOvertime ? 'Lembur' : isOutside ? 'Luar Kantor' : 'Terlambat';

    const colorConfig = {
        'Terlambat':   { bg: 'bg-amber-500',   light: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200',   icon: Clock },
        'Lembur':      { bg: 'bg-orange-500',  light: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-200',  icon: Clock },
        'Luar Kantor': { bg: 'bg-red-500',     light: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200',     icon: MapPin },
    };
    const cfg = colorConfig[primaryType];
    const IconComp = cfg.icon;

    const handleSubmit = () => {
        if (!notes.trim() || notes.trim().length < 10) {
            setError('Alasan wajib diisi minimal 10 karakter');
            return;
        }
        setError('');
        onSubmit({ notes: notes.trim(), anomalyTypes, primaryType, ...anomalyData });
        setNotes('');
    };

    const handleClose = () => {
        setNotes('');
        setError('');
        onClose();
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40"
            onClick={handleClose}
        >
            <div
                className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`relative p-6 pb-5 ${cfg.bg} overflow-hidden shrink-0`}>
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full" style={{ background: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
                    </div>
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 text-white hover:bg-white/40 transition-all z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="relative z-10 flex items-center gap-3 pr-10">
                        <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center border border-white/20 backdrop-blur-sm shrink-0">
                            <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white tracking-tight leading-tight">
                                Pengajuan {anomalyTypes.join(' & ')}
                            </h3>
                            <p className="text-white/70 text-[10px] font-bold tracking-widest uppercase mt-1">
                                Diperlukan Persetujuan HRD
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-hide">

                    {/* Info Anomali */}
                    <div className={`rounded-2xl ${cfg.light} ${cfg.border} border p-4 space-y-3`}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Detail Anomali Terdeteksi</p>

                        {/* Terlambat */}
                        {isLate && (
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Clock className={`w-4 h-4 ${cfg.text}`} />
                                    <span className="text-xs font-bold text-primary/70">Terlambat Check-in</span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs font-black ${cfg.text}`}>{formatDuration(diffMinutes)}</span>
                                    <p className="text-[9px] text-primary/40 font-bold">
                                        Jadwal: {shift?.checkIn} → Aktual: {detectedTime}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Lembur */}
                        {isOvertime && (
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Clock className={`w-4 h-4 ${cfg.text}`} />
                                    <span className="text-xs font-bold text-primary/70">Lembur Check-out</span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs font-black ${cfg.text}`}>{formatDuration(diffMinutes)}</span>
                                    <p className="text-[9px] text-primary/40 font-bold">
                                        Jadwal: {shift?.checkOut} → Aktual: {detectedTime}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Luar Kantor */}
                        {isOutside && (
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-red-500" />
                                    <span className="text-xs font-bold text-primary/70">Absen di Luar Kantor</span>
                                </div>
                                <span className="text-xs font-black text-red-500">Terdeteksi</span>
                            </div>
                        )}

                        {/* Shift Info */}
                        {shift && (
                            <div className="pt-2 border-t border-primary/5 flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary/30">Shift Kamu</span>
                                <span className="text-[10px] font-black text-primary/60">
                                    {shift.label} ({shift.checkIn} – {shift.checkOut})
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Notes Input */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary/60">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Alasan / Keterangan
                            <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            rows={4}
                            value={notes}
                            onChange={(e) => { setNotes(e.target.value); if (error) setError(''); }}
                            placeholder={`Jelaskan alasan ${primaryType.toLowerCase()} kamu hari ini...`}
                            className={`w-full px-4 py-3 rounded-2xl bg-gray-50 border ${error ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/10 focus:ring-primary/10'} outline-none text-primary font-medium text-sm focus:ring-4 transition-all resize-none placeholder:text-primary/20 leading-relaxed`}
                        />
                        <div className="flex justify-between items-center px-1">
                            {error
                                ? <p className="text-red-500 text-[10px] font-bold">{error}</p>
                                : <p className="text-primary/30 text-[10px] font-bold">Minimal 10 karakter</p>
                            }
                            <span className={`text-[10px] font-bold ${notes.length >= 10 ? 'text-green-500' : 'text-primary/30'}`}>
                                {notes.length} karakter
                            </span>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-secondary/20 rounded-2xl p-3 border border-primary/5">
                        <p className="text-[10px] font-bold text-primary/50 leading-relaxed">
                            💡 Pengajuan ini akan dikirim ke HRD untuk di-review. Absensi kamu tetap tercatat, namun status akan bergantung pada keputusan HRD.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-primary/5 flex gap-3 shrink-0 bg-gray-50/30">
                    <button
                        onClick={handleClose}
                        className="flex-1 py-3.5 rounded-2xl border border-primary/10 text-primary/60 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        className={`flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-2xl ${cfg.bg} text-white font-black text-[10px] uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg`}
                    >
                        <Send className="w-3.5 h-3.5" />
                        Kirim ke HRD
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default OvertimeNoteModal;
