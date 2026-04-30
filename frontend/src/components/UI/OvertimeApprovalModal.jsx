import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, MapPin, CheckCircle2, XCircle, User, MessageSquare, AlertTriangle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { formatDuration, SHIFTS } from '../../utils/shiftConfig';

/**
 * OvertimeApprovalModal
 * Modal untuk HRD menyetujui atau menolak pengajuan lembur/keterlambatan karyawan.
 */
const OvertimeApprovalModal = ({ isOpen, onClose, requestData, onUpdateStatus, showActions = true }) => {
    const { showToast } = useToast();
    const [hrdNote, setHrdNote] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    if (!isOpen || !requestData) return null;

    const { staffName, role, shift: shiftKey, primaryType, anomalyTypes, detectedTime, diffMinutes, notes, date, status, scheduledTime } = requestData;

    const shiftInfo = SHIFTS[shiftKey] || null;

    const colorConfig = {
        'Terlambat':   { bg: 'bg-amber-500',   light: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200',   badgeBg: 'bg-amber-100', icon: Clock },
        'Lembur':      { bg: 'bg-orange-500',  light: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-200',  badgeBg: 'bg-orange-100', icon: Clock },
        'Luar Kantor': { bg: 'bg-red-500',     light: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200',     badgeBg: 'bg-red-100', icon: MapPin },
    };
    const cfg = colorConfig[primaryType] || colorConfig['Terlambat'];
    const IconComp = cfg.icon;

    const handleApprove = () => {
        onUpdateStatus(requestData.id, 'Disetujui', '');
        showToast(`Pengajuan ${primaryType} ${staffName} disetujui.`, 'success');
        setHrdNote('');
        setShowRejectInput(false);
        onClose();
    };

    const handleReject = () => {
        if (!showRejectInput) {
            setShowRejectInput(true);
            return;
        }
        onUpdateStatus(requestData.id, 'Ditolak', hrdNote);
        showToast(`Pengajuan ${primaryType} ${staffName} ditolak.`, 'error');
        setHrdNote('');
        setShowRejectInput(false);
        onClose();
    };

    const handleClose = () => {
        setHrdNote('');
        setShowRejectInput(false);
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
                        <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 text-white hover:bg-white/40 transition-all z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="relative z-10 flex items-center gap-3 pr-10">
                        <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center border border-white/20 backdrop-blur-sm shrink-0">
                            <IconComp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white tracking-tight leading-tight">
                                Persetujuan {primaryType}
                            </h3>
                            <p className="text-white/70 text-[10px] font-bold tracking-widest uppercase mt-1">
                                Review Pengajuan Karyawan
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 overflow-y-auto flex-1 scrollbar-hide">

                    {/* Info Karyawan */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-primary/5">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-xs font-black text-primary border border-primary/5 shrink-0">
                            {staffName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-black text-primary tracking-tight">{staffName}</p>
                            <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">{role}</p>
                        </div>
                        <div className="ml-auto flex flex-col items-end gap-1">
                            {(anomalyTypes || [primaryType]).map(t => (
                                <span key={t} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${colorConfig[t]?.badgeBg || 'bg-gray-100'} ${colorConfig[t]?.text || 'text-gray-600'}`}>
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Detail Anomali */}
                    <div className={`rounded-2xl ${cfg.light} ${cfg.border} border p-4 space-y-3`}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Detail Kejadian</p>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-primary/30 mb-1">Tanggal</p>
                                <p className="text-xs font-black text-primary">{date}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-primary/30 mb-1">Jam Aktual</p>
                                <p className={`text-xs font-black ${cfg.text}`}>{detectedTime}</p>
                            </div>
                            {scheduledTime && (
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-primary/30 mb-1">Jam Jadwal</p>
                                    <p className="text-xs font-black text-primary/70">{scheduledTime}</p>
                                </div>
                            )}
                            {diffMinutes > 0 && (
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-primary/30 mb-1">Selisih</p>
                                    <p className={`text-xs font-black ${cfg.text}`}>{formatDuration(diffMinutes)}</p>
                                </div>
                            )}
                        </div>

                        {shiftInfo && (
                            <div className="pt-2 border-t border-primary/5 flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary/30">Shift Karyawan</span>
                                <span className="text-[10px] font-black text-primary/60">
                                    {shiftInfo.label} ({shiftInfo.checkIn} – {shiftInfo.checkOut})
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Notes Karyawan */}
                    <div className="space-y-2">
                        <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary/40">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Alasan dari Karyawan
                        </p>
                        <div className="p-4 rounded-2xl bg-secondary/20 border border-primary/5">
                            <p className="text-sm font-medium text-primary/80 leading-relaxed italic">
                                "{notes}"
                            </p>
                        </div>
                    </div>

                    {/* Input Catatan HRD (muncul saat tolak) */}
                    {showRejectInput && (
                        <div className="space-y-2 animate-fade-in">
                            <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-500">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Catatan Penolakan (Opsional)
                            </label>
                            <textarea
                                rows={3}
                                value={hrdNote}
                                onChange={(e) => setHrdNote(e.target.value)}
                                placeholder="Berikan alasan penolakan kepada karyawan..."
                                className="w-full px-4 py-3 rounded-2xl bg-red-50 border border-red-200 outline-none text-primary font-medium text-sm focus:ring-4 focus:ring-red-400/20 transition-all resize-none placeholder:text-primary/20 leading-relaxed"
                            />
                        </div>
                    )}

                    {/* Status Badge (jika sudah diproses) */}
                    {status !== 'Menunggu' && (
                        <div className={`p-4 rounded-2xl border text-center ${status === 'Disetujui' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-500'}`}>
                            <p className="text-[10px] font-black uppercase tracking-widest">Status: {status}</p>
                            {requestData.hrdNote && (
                                <p className="text-xs font-medium mt-1 opacity-80">Catatan HRD: {requestData.hrdNote}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {showActions && status === 'Menunggu' && (
                    <div className="p-5 border-t border-primary/5 flex gap-3 shrink-0 bg-gray-50/30">
                        <button
                            onClick={handleReject}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl ${showRejectInput ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-red-50 text-red-500 border border-red-100'} font-black text-[10px] uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all`}
                        >
                            <XCircle className="w-4 h-4" />
                            {showRejectInput ? 'Konfirmasi Tolak' : 'Tolak'}
                        </button>
                        <button
                            onClick={handleApprove}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-green-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-green-600 active:scale-95 transition-all shadow-lg shadow-green-500/20"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Setujui
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default OvertimeApprovalModal;
