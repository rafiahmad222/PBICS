import React from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Phone, ShieldCheck, User, Calendar, MapPin, Hash, Building2 } from 'lucide-react';

const StaffDetailModal = ({ isOpen, onClose, staff }) => {
    if (!isOpen || !staff) return null;

    const initials = staff.name.split(' ').map(n => n[0]).join('').substring(0, 2);

    // Format tanggal untuk UI yang lebih baik
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 transition-opacity"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Tombol Silang Luar (z-index tinggi) */}
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                    className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/40 hover:scale-105 active:scale-95 transition-all z-[60] shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header Modal */}
                <div className="relative p-8 pb-8 bg-primary overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10 z-0">
                        <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>

                    <div className="relative z-10 flex items-center gap-4 pr-12">
                        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-primary text-xl font-black shadow-lg border-2 border-primary-light shrink-0">
                             {initials}
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-loose">
                                {staff.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                    staff.status === 'Aktif' ? 'bg-green-100 text-green-800' :
                                    staff.status === 'Cuti' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {staff.status}
                                </span>
                                <span className="text-white/80 text-[10px] font-bold tracking-widest uppercase border border-white/20 px-2 py-0.5 rounded-full">{staff.id}</span>
                                <span className="text-white/90 text-[10px] font-bold tracking-widest uppercase bg-secondary/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Building2 className="w-3 h-3" /> {staff.cabang}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Body Details */}
                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar bg-gray-50/30">
                    
                    <div className="space-y-6">
                        
                        {/* Section 1: Jabatan & Peran */}
                        <div className="bg-white p-5 rounded-3xl border border-primary/5 shadow-sm space-y-4">
                            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40 pb-2 border-b border-primary/5">
                                <BriefcaseIcon /> Posisi & Pekerjaan
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mb-1">Jabatan & Divisi</p>
                                    <p className="text-sm font-black text-primary flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-accent-gold" /> {['HRD', 'Owner', 'Komisaris'].includes(staff.divisi) ? staff.divisi : `${staff.posisi} - ${staff.divisi}`}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mb-1">Penempatan</p>
                                    <p className="text-sm font-bold text-primary flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-primary/40" /> 
                                        Klinik {staff.cabang}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mb-1">Tgl Bergabung</p>
                                    <p className="text-sm font-bold text-primary flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary/40" /> {formatDate(staff.tanggal_bergabung)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Data Diri */}
                        <div className="bg-white p-5 rounded-3xl border border-primary/5 shadow-sm space-y-4">
                            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40 pb-2 border-b border-primary/5">
                                <User className="w-3.5 h-3.5" /> Data Diri Karyawan
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mb-1">NIK (Nomor Induk Kependudukan)</p>
                                        <p className="text-sm font-bold text-primary flex items-center gap-2">
                                            <Hash className="w-4 h-4 text-primary/40" /> {staff.nik || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mb-1">Tempat & Tanggal Lahir</p>
                                        <p className="text-sm font-bold text-primary flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-primary/40" /> 
                                            {staff.tempat_lahir ? `${staff.tempat_lahir}, ` : ''}{formatDate(staff.tanggal_lahir)}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mb-1">Alamat Domisili</p>
                                    <p className="text-sm font-bold text-primary flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-primary/40 shrink-0 mt-0.5" /> 
                                        <span>{staff.alamat || '-'}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Kontak */}
                        <div className="bg-white p-5 rounded-3xl border border-primary/5 shadow-sm space-y-4">
                            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40 pb-2 border-b border-primary/5">
                                <Phone className="w-3.5 h-3.5" /> Informasi Kontak
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mb-1">Alamat Email</p>
                                    <p className="text-sm font-bold text-primary flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-primary/40" /> {staff.email}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mb-1">Nomor Telepon</p>
                                    <p className="text-sm font-bold text-primary flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-primary/40" /> {staff.phone}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
);

export default StaffDetailModal;
