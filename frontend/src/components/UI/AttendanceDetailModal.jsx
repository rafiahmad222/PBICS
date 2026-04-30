import React from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, MapPin, Camera, User, BadgeCheck, Calendar } from 'lucide-react';

const AttendanceDetailModal = ({ isOpen, onClose, staffData }) => {
    if (!isOpen || !staffData) return null;

    return createPortal(
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30"
            onClick={onClose}
        >
            {/* Modal Content */}
            <div 
                className="relative w-full max-w-2xl bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                    className="absolute top-6 right-6 p-2.5 rounded-2xl bg-black/20 backdrop-blur-md text-white hover:bg-black/40 hover:scale-105 active:scale-95 transition-all z-[60] shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header Profile */}
                <div className="relative h-40 bg-primary overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>

                    <div className="absolute -bottom-12 left-8 md:left-12 flex items-end gap-6 pr-12">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] bg-white p-2 shadow-2xl">
                            <div className="w-full h-full rounded-[1.5rem] md:rounded-[2rem] bg-secondary-light flex items-center justify-center text-2xl md:text-4xl font-black text-primary border border-primary/5 overflow-hidden">
                                {staffData.name.split(' ').map(n => n[0]).join('')}
                            </div>
                        </div>
                        <div className="mb-14">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">{staffData.name}</h3>
                                <BadgeCheck className="w-5 h-5 text-accent-gold" />
                            </div>
                            <p className="text-white/60 text-xs font-bold tracking-widest uppercase">{staffData.role} • {staffData.id}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-16 p-8 md:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {/* Attendance Timeline */}
                        <div className="space-y-8">
                            <div>
                                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 mb-6">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Statistik Hari Ini
                                </h4>
                                <div className="space-y-4">
                                    <div className="p-5 rounded-3xl bg-secondary/20 border border-primary/5 flex justify-between items-center group hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest mb-0.5">Jam Masuk</p>
                                                <p className="text-sm font-black text-primary">{staffData.checkIn}</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest">Tepat Waktu</span>
                                    </div>

                                    <div className="p-5 rounded-3xl bg-secondary/20 border border-primary/5 flex justify-between items-center group hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest mb-0.5">Jam Keluar</p>
                                                <p className="text-sm font-black text-primary">{staffData.checkOut}</p>
                                            </div>
                                        </div>
                                        {staffData.checkOut !== '--:--' && (
                                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest">Selesai</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scan Photos */}
                        <div className="space-y-6">
                            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 mb-6">
                                <Camera className="w-3.5 h-3.5" />
                                Bukti Face Scan
                            </h4>

                            <div className="flex gap-4">
                                {/* Check-in Photo */}
                                <div className="flex-1 space-y-3">
                                    <div className="aspect-[3/4] rounded-[2rem] bg-secondary/40 border-2 border-primary/5 overflow-hidden shadow-inner group">
                                        {staffData.photoIn ? (
                                            <img src={staffData.photoIn} alt="Check-in" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-primary/20 p-4 text-center">
                                                <User className="w-8 h-8 mb-2 opacity-20" />
                                                <p className="text-[8px] font-black uppercase tracking-widest">Belum Ada Foto</p>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-center text-[10px] font-black text-primary/30 uppercase tracking-widest">Datang</p>
                                </div>

                                {/* Check-out Photo */}
                                <div className="flex-1 space-y-3">
                                    <div className="aspect-[3/4] rounded-[2rem] bg-secondary/40 border-2 border-primary/5 overflow-hidden shadow-inner group">
                                        {staffData.photoOut ? (
                                            <img src={staffData.photoOut} alt="Check-out" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-primary/20 p-4 text-center">
                                                <User className="w-8 h-8 mb-2 opacity-20" />
                                                <p className="text-[8px] font-black uppercase tracking-widest">Belum Ada Foto</p>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-center text-[10px] font-black text-primary/30 uppercase tracking-widest">Pulang</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="p-8 md:p-10 bg-secondary/10 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-accent-gold" />
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Verified Work Location • HQ Clinic</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Data Aman & Terenkripsi</span>
                    </div>
                </div>
            </div>
        </div>
    , document.body);
};

export default AttendanceDetailModal;
