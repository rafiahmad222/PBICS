import React from 'react';
import { createPortal } from 'react-dom';
import { X, CalendarDays, CheckCircle2, XCircle, Image as ImageIcon, FileText, Paperclip } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const LeaveApprovalModal = ({ isOpen, onClose, requestData, onUpdateStatus, showActions = true }) => {
    const { showToast } = useToast();

    if (!isOpen || !requestData) return null;

    const handleApprove = () => {
        onUpdateStatus(requestData.id, 'Disetujui');
        showToast('Pengajuan cuti disetujui.', 'success');
        onClose();
    };

    const handleReject = () => {
        onUpdateStatus(requestData.id, 'Ditolak');
        showToast('Pengajuan cuti ditolak.', 'error');
        onClose();
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                    className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/40 hover:scale-105 active:scale-95 transition-all z-[60] shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="relative p-8 pb-6 bg-primary overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>

                    <div className="relative z-10 flex items-center gap-4 pr-12">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-secondary backdrop-blur-sm border border-white/10">
                            <CalendarDays className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">Persetujuan Cuti</h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">Detail Pengajuan</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 border-t-[0.5px] border-primary/5 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">nama karyawan</p>
                            <p className="text-sm font-bold text-primary">{requestData.staffName} <span className="text-xs text-primary/40 font-semibold">({requestData.role})</span></p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Jenis</p>
                                <p className="text-sm font-bold text-primary">{requestData.type}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Tanggal</p>
                                <p className="text-sm font-bold text-primary">{requestData.startDate} <br/>s/d<br/> {requestData.endDate}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Alasan Terperinci</p>
                            <div className="p-4 rounded-2xl bg-secondary/20 border border-primary/5 text-sm font-bold text-primary/80">
                                {requestData.reason}
                            </div>
                        </div>

                        {requestData.attachment && (
                            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2 flex items-center gap-1.5 italic">
                                    <Paperclip className="w-3 h-3" />
                                    Dokumen Pendukung
                                </p>
                                <div className="relative group overflow-hidden rounded-2xl border border-primary/10 bg-gray-50 aspect-video flex flex-col items-center justify-center p-4">
                                    <ImageIcon className="w-10 h-10 text-primary/10 mb-2" />
                                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-4">{requestData.attachment}</p>
                                    
                                    {/* Link Simulasi Lihat Foto */}
                                    <button className="px-6 py-2 bg-primary text-secondary rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                        Lihat Foto Full
                                    </button>

                                    {/* Overlay Gradient (Aesthetic) */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                                </div>
                            </div>
                        )}
                    </div>

                    {showActions && requestData.status === 'Menunggu' && (
                        <div className="flex gap-4 pt-4 border-t border-primary/5">
                            <button
                                onClick={handleReject}
                                className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-500 py-4 rounded-2xl hover:bg-red-500 hover:text-white transition-all font-black text-xs uppercase tracking-widest"
                            >
                                <XCircle className="w-4 h-4" />
                                Tolak
                            </button>
                            <button
                                onClick={handleApprove}
                                className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-600 py-4 rounded-2xl hover:bg-green-500 hover:text-white transition-all font-black text-xs uppercase tracking-widest"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Setujui
                            </button>
                        </div>
                    )}

                    {requestData.status !== 'Menunggu' && (
                        <div className={`mt-4 p-4 rounded-2xl border text-center ${
                            requestData.status === 'Disetujui' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-500'
                        }`}>
                            <p className="text-[10px] font-black uppercase tracking-widest italic">
                                Status Pengajuan: {requestData.status}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    , document.body);
};

export default LeaveApprovalModal;

