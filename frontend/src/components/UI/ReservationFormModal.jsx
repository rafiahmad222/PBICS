import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, User, Phone, Clock, FileText, CheckCircle2, Edit3 } from 'lucide-react';
import { useMockData } from '../../context/MockDataContext';
import { useToast } from '../../context/ToastContext';
import CustomSelect from './CustomSelect';
import ConfirmModal from './ConfirmModal';




const ReservationFormModal = ({ isOpen, onClose, initialData }) => {
    const { staff, addBooking, updateBooking, slotAvailability } = useMockData();

    const { showToast } = useToast();
    const isEditMode = !!initialData;

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        time: '',
        broughtByStaff: '',
        notes: '',
        status: 'Menunggu'
    });

    const [availableStaff, setAvailableStaff] = useState([]);
    const [errors, setErrors] = useState({});
    const [confirmConfig, setConfirmConfig] = useState(null);


    useEffect(() => {
        if (isOpen) {
            setErrors({});
            setAvailableStaff(staff.filter(s =>
                s.status === 'Aktif' &&
                (s.divisi === 'Customer Service' || s.divisi === 'Dokter' || s.divisi === 'Kasir')
            ).map(s => ({ value: s.name, label: s.name })));

            if (isEditMode && initialData) {
                setFormData({
                    name: initialData.name || '',
                    phone: initialData.phone || '',
                    time: initialData.time || '',
                    broughtByStaff: initialData.broughtByStaff || '',
                    notes: initialData.notes || '',
                    status: initialData.status || 'Menunggu'
                });
            } else {
                setFormData({ name: '', phone: '', time: '', broughtByStaff: '', notes: '', status: 'Menunggu' });
            }
        }
    }, [isOpen, staff, isEditMode, initialData]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Nama customer wajib diisi';
        if (!formData.phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi';
        if (!formData.time) newErrors.time = 'Jam reservasi wajib diisi';
        if (!formData.broughtByStaff) newErrors.broughtByStaff = 'Pilih Karyawan terlebih dahulu';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setConfirmConfig({
            icon: 'save',
            header: isEditMode ? 'Simpan Perubahan' : 'Konfirmasi Reservasi',
            message: isEditMode ? 
                `Simpan perubahan untuk reservasi ${formData.name}?` : 
                `Buat reservasi baru untuk ${formData.name}?`,
            acceptLabel: isEditMode ? 'Ya, Simpan' : 'Ya, Simpan',
            onAccept: () => {
                if (isEditMode) {
                    updateBooking({ ...initialData, ...formData });
                    showToast('Reservasi berhasil diperbarui', 'success');
                } else {
                    addBooking({ ...formData, status: 'Menunggu' });
                    showToast('Reservasi baru berhasil ditambahkan', 'success');
                }
                onClose();
            }
        });
    };


    const labelClass = "text-[10px] font-medium uppercase tracking-widest text-primary/40 block mb-2 px-1";
    const inputClass = "w-full px-5 py-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium text-primary shadow-sm placeholder:text-primary/20 placeholder:font-medium";

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/30 transition-opacity" onClick={onClose}>
            <div
                className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
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
                            {isEditMode ? <Edit3 className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                                {isEditMode ? 'Edit Reservasi' : 'Reservasi Baru'}
                            </h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                {isEditMode ? `Mengubah data — ${initialData?.name}` : 'Daftarkan Jadwal Kunjungan Customer'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-8 overflow-y-auto scrollbar-hide flex-1 bg-gray-50/30">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Detail Customer */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-primary/5 pb-2">
                                <User className="w-4 h-4 text-primary/30" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Detail Customer</h4>
                            </div>

                            <div className="space-y-1">
                                <label className={labelClass}>Nama Customer</label>
                                <input
                                    type="text"
                                    placeholder="Nama lengkap customer..."
                                    className={`${inputClass} ${errors.name ? 'border-red-400 focus:ring-red-400/20' : ''}`}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.name}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className={labelClass}>Nomor Telepon</label>
                                <div className="relative group">
                                    <input
                                        type="tel"
                                        placeholder="08xxxxxxxxxx"
                                        className={`${inputClass} ${errors.phone ? 'border-red-400 focus:ring-red-400/20' : ''}`}
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                    <Phone className="w-4 h-4 text-primary/20 absolute right-5 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                                </div>
                                {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.phone}</p>}
                            </div>
                        </div>

                        {/* Jadwal & Karyawan */}
                        <div className="space-y-6 pt-2">
                            <div className="flex items-center gap-3 border-b border-primary/5 pb-2">
                                <Clock className="w-4 h-4 text-primary/30" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Jadwal &amp; Karyawan</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className={labelClass}>Jam Reservasi</label>
                                    <CustomSelect
                                        options={slotAvailability
                                            .filter(slot => slot.available || (isEditMode && initialData?.time === slot.time))
                                            .map(slot => ({ value: slot.time, label: slot.time }))}
                                        value={formData.time}
                                        onChange={(val) => setFormData({ ...formData, time: val })}
                                        placeholder="Pilih Jam..."
                                    />
                                    {errors.time && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.time}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className={labelClass}>Karyawan Pengampu</label>
                                    <CustomSelect
                                        options={availableStaff}
                                        value={formData.broughtByStaff}
                                        onChange={(val) => setFormData({ ...formData, broughtByStaff: val })}
                                        placeholder="Pilih Karyawan..."
                                        searchable={true}
                                    />
                                    {errors.broughtByStaff && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.broughtByStaff}</p>}
                                </div>
                            </div>
                        </div>



                        {/* Catatan */}
                        <div className="space-y-6 pt-2">
                            <div className="flex items-center gap-3 border-b border-primary/5 pb-2">
                                <FileText className="w-4 h-4 text-primary/30" />
                                <h4 className="text-[10px] font-medium uppercase tracking-widest text-primary/40">Catatan Tambahan</h4>
                            </div>
                            <div className="space-y-1">
                                <textarea
                                    placeholder="Tambahkan keterangan atau kebutuhan khusus customer..."
                                    className={`${inputClass} h-24 resize-none`}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-8 border-t border-primary/5 mt-auto flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-secondary/40 text-primary py-4 rounded-2xl hover:bg-secondary active:scale-[0.98] transition-all duration-300 font-black text-xs uppercase tracking-widest"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="flex-[2] flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-2xl hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                {isEditMode ? 'Simpan Perubahan' : 'Simpan Reservasi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <ConfirmModal
                config={confirmConfig}
                onClose={() => setConfirmConfig(null)}
            />
        </div>,

        document.body
    );
};

export default ReservationFormModal;

