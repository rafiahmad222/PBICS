import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, User, UserPlus, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import CustomSelect from './CustomSelect';

const StaffFormModal = ({ isOpen, onClose, onSave, initialData, existingStaff = [] }) => {
    const isEdit = !!initialData;

    const [step, setStep] = useState(1);
    const [formState, setFormState] = useState({
        name: '',
        nik: '',
        tanggal_lahir: '',
        divisi: '',
        posisi: '',
        cabang: '',
        email: '',
        phone: '',
        alamat: '',
        username: '',
        password: '',
        tempat_lahir: '',
        tanggal_bergabung: '',
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setErrors({});
            setShowPassword(false);
            if (initialData) {
                setFormState({
                    name: initialData.name || '',
                    nik: initialData.nik || '',
                    tempat_lahir: initialData.tempat_lahir || '',
                    tanggal_lahir: initialData.tanggal_lahir || '',
                    divisi: initialData.divisi || 'Dokter',
                    posisi: initialData.posisi || 'Anggota Staff',
                    cabang: initialData.cabang || 'Jember',
                    email: initialData.email || '',
                    phone: initialData.phone || '',
                    alamat: initialData.alamat || '',
                    username: initialData.username || '',
                    password: initialData.password || '',
                    tanggal_bergabung: initialData.tanggal_bergabung ? initialData.tanggal_bergabung.split('T')[0] : '',
                });
            } else {
                setFormState({
                    name: '',
                    nik: '',
                    tempat_lahir: '',
                    tanggal_lahir: '',
                    divisi: '',
                    posisi: '',
                    cabang: '',
                    email: '',
                    phone: '',
                    alamat: '',
                    username: '',
                    password: '',
                    tanggal_bergabung: new Date().toISOString().split('T')[0], // Default ke hari ini
                });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const validateStep1 = () => {
        let newErrors = {};
        if (!formState.name.trim()) newErrors.name = "Nama lengkap wajib diisi";

        if (!formState.nik.trim()) newErrors.nik = "NIK wajib diisi";
        else if (!/^\d+$/.test(formState.nik)) newErrors.nik = "NIK hanya boleh berisi angka (tidak boleh ada huruf/simbol)";
        else if (formState.nik.length < 16) newErrors.nik = "NIK minimal 16 angka";

        if (!formState.tempat_lahir.trim()) newErrors.tempat_lahir = "Tempat lahir wajib diisi";
        if (!formState.tanggal_lahir) newErrors.tanggal_lahir = "Tanggal lahir wajib diisi";

        if (!formState.divisi) newErrors.divisi = "Divisi wajib diisi";
        if (!formState.posisi) newErrors.posisi = "Posisi wajib diisi";

        if (!formState.cabang) newErrors.cabang = "Cabang wajib diisi";
        if (!formState.tanggal_bergabung) newErrors.tanggal_bergabung = "Tanggal bergabung wajib diisi";

        if (!formState.phone.trim()) newErrors.phone = "Nomor telepon wajib diisi";
        else if (!/^\d+$/.test(formState.phone)) newErrors.phone = "Nomor telepon hanya boleh berisi angka";

        if (!formState.email.trim()) newErrors.email = "Email wajib diisi";
        else if (!/\S+@\S+\.\S+/.test(formState.email)) newErrors.email = "Format email tidak valid";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        let newErrors = {};
        if (!formState.username.trim()) newErrors.username = "Username wajib diisi";
        else if (/\s/.test(formState.username)) newErrors.username = "Username tidak boleh mengandung spasi";
        else {
            const isDuplicate = existingStaff.some(
                staff => staff.username === formState.username && (!isEdit || staff.id !== initialData.id)
            );
            if (isDuplicate) {
                newErrors.username = "Username sudah digunakan, silakan pilih yang lain";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        let newErrors = {};
        if (!formState.password) newErrors.password = "Password wajib diisi";
        else if (formState.password.length < 6) newErrors.password = "Password minimal 6 karakter";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        }
    };

    const handlePrev = () => {
        if (step > 1) {
            setStep(prev => prev - 1);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (step < 3) {
            handleNext();
        } else {
            if (validateStep3()) {
                const finalData = { ...formState };
                onSave(finalData);
            }
        }
    };

    const handleChange = (field, value) => {
        setFormState(prev => {
            const updated = { ...prev, [field]: value };
            return updated;
        });
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 transition-opacity"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]"
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
                <div className="relative p-8 pb-6 bg-primary overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10 z-0">
                        <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>

                    <div className="relative z-10 flex items-center gap-4 pr-12">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-secondary backdrop-blur-sm border border-white/10 shrink-0">
                            {isEdit ? <User className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                                {isEdit ? 'Edit Data karyawan' : 'Tambah Karyawan Baru'}
                            </h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                Langkah {step} dari 3 • {step === 1 ? 'Data Diri & Penempatan' : step === 2 ? 'Detail Akun (Username)' : 'Keamanan (Password)'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body Form */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30">

                    {/* Progress Bar Dinamis */}
                    <div className="flex gap-2 mb-8">
                        <div className="h-1.5 flex-1 rounded-full bg-primary/20 overflow-hidden">
                            <div className={`h-full bg-primary transition-all duration-500 ease-out ${step >= 1 ? 'w-full' : 'w-0'}`} />
                        </div>
                        <div className="h-1.5 flex-1 rounded-full bg-primary/20 overflow-hidden">
                            <div className={`h-full bg-primary transition-all duration-500 ease-out ${step >= 2 ? 'w-full' : 'w-0'}`} />
                        </div>
                        <div className="h-1.5 flex-1 rounded-full bg-primary/20 overflow-hidden">
                            <div className={`h-full bg-primary transition-all duration-500 ease-out ${step >= 3 ? 'w-full' : 'w-0'}`} />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">

                        {/* -------------------- STEP 1 -------------------- */}
                        {step === 1 && (
                            <div className="space-y-6 animate-fade-in">
                                {/* Data Personal */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40 border-b border-primary/5 pb-2">Informasi Personal</h4>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            value={formState.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            placeholder="Masukkan nama lengkap Karyawan"
                                            className={`w-full px-5 py-3.5 rounded-2xl bg-white border ${errors.name ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/10 focus:ring-primary/10'} outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm placeholder:text-primary/20`}
                                        />
                                        {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.name}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">NIK</label>
                                            <input
                                                type="text"
                                                value={formState.nik}
                                                onChange={(e) => handleChange('nik', e.target.value)}
                                                placeholder="Nomor Induk Kependudukan"
                                                className={`w-full px-5 py-3.5 rounded-2xl bg-white border ${errors.nik ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/10 focus:ring-primary/10'} outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm placeholder:text-primary/20`}
                                            />
                                            {errors.nik && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 animate-pulse">{errors.nik}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Tempat Lahir</label>
                                            <input
                                                type="text"
                                                value={formState.tempat_lahir}
                                                onChange={(e) => handleChange('tempat_lahir', e.target.value)}
                                                placeholder="Contoh: Jakarta"
                                                className={`w-full px-5 py-3.5 rounded-2xl bg-white border ${errors.tempat_lahir ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/10 focus:ring-primary/10'} outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm`}
                                            />
                                            {errors.tempat_lahir && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.tempat_lahir}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Tanggal Lahir</label>
                                            <input
                                                type="date"
                                                value={formState.tanggal_lahir}
                                                onChange={(e) => handleChange('tanggal_lahir', e.target.value)}
                                                className={`w-full px-5 py-3.5 rounded-2xl bg-white border ${errors.tanggal_lahir ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/10 focus:ring-primary/10'} outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm`}
                                            />
                                            {errors.tanggal_lahir && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.tanggal_lahir}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Alamat</label>
                                            <input
                                                type="text"
                                                value={formState.alamat}
                                                onChange={(e) => handleChange('alamat', e.target.value)}
                                                placeholder="Masukkan alamat lengkap Karyawan"
                                                className={`w-full px-5 py-3.5 rounded-2xl bg-white border ${errors.alamat ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/10 focus:ring-primary/10'} outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm placeholder:text-primary/20`}
                                            />
                                            {errors.alamat && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.alamat}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Posisi & Penempatan */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40 border-b border-primary/5 pb-2">Posisi & Penempatan</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Divisi Karyawan</label>
                                            <CustomSelect
                                                value={formState.divisi}
                                                onChange={(value) => handleChange('divisi', value)}
                                                options={[
                                                    { value: 'Dokter', label: 'Dokter' },
                                                    { value: 'Customer Service', label: 'Customer Service' },
                                                    { value: 'Perawat', label: 'Perawat' },
                                                    { value: 'Staff Gudang', label: 'Staff Gudang' },
                                                    { value: 'Kasir', label: 'Kasir' },
                                                    { value: 'Manager', label: 'Manager' },
                                                    { value: 'HRD', label: 'HRD' },
                                                    { value: 'Owner', label: 'Owner' },
                                                    { value: 'Komisaris', label: 'Komisaris' }
                                                ]}
                                            />
                                            {errors.divisi && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.divisi}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Posisi Jabatan</label>
                                            <CustomSelect
                                                value={formState.posisi}
                                                onChange={(value) => handleChange('posisi', value)}
                                                options={[
                                                    { value: 'Lead', label: 'Lead' },
                                                    { value: 'Anggota Staff', label: 'Anggota Staff' }
                                                ]}
                                            />
                                            {errors.posisi && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.posisi}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Cabang</label>
                                            <CustomSelect
                                                value={formState.cabang}
                                                onChange={(value) => handleChange('cabang', value)}
                                                options={[
                                                    { value: 'Jember', label: 'Klinik Cabang Jember' },
                                                    { value: 'Lumajang', label: 'Klinik Cabang Lumajang' },
                                                ]}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Tanggal Bergabung</label>
                                            <input
                                                type="date"
                                                value={formState.tanggal_bergabung}
                                                onChange={(e) => handleChange('tanggal_bergabung', e.target.value)}
                                                className={`w-full px-5 py-3.5 rounded-2xl bg-white border ${errors.tanggal_bergabung ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/10 focus:ring-primary/10'} outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm`}
                                            />
                                            {errors.tanggal_bergabung && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.tanggal_bergabung}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Informasi Kontak */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40 border-b border-primary/5 pb-2">Informasi Kontak</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Email</label>
                                            <input
                                                type="text"
                                                value={formState.email}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                                placeholder="email@contoh.com"
                                                className={`w-full px-5 py-3.5 rounded-2xl bg-white border ${errors.email ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/10 focus:ring-primary/10'} outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm placeholder:text-primary/20`}
                                            />
                                            {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.email}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">No. Telp</label>
                                            <input
                                                type="tel"
                                                value={formState.phone}
                                                onChange={(e) => handleChange('phone', e.target.value)}
                                                placeholder="08xxxxxxxxxx"
                                                className={`w-full px-5 py-3.5 rounded-2xl bg-white border ${errors.phone ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/10 focus:ring-primary/10'} outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm placeholder:text-primary/20`}
                                            />
                                            {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 animate-pulse">{errors.phone}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Aksi Bawah */}
                                <div className="pt-4 border-t border-primary/5 mt-8">
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="w-full flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                                    >
                                        Selanjutnya
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* -------------------- STEP 2 -------------------- */}
                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                {/* Akun & Keamanan */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40 border-b border-primary/5 pb-2">Detail Akun</h4>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Username Login</label>
                                            <input
                                                type="text"
                                                value={formState.username}
                                                onChange={(e) => handleChange('username', e.target.value)}
                                                placeholder="Contoh: sarah123"
                                                className={`w-full px-5 py-4 rounded-2xl bg-white border ${errors.username ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/10 focus:ring-primary/10'} outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm placeholder:text-primary/20`}
                                            />
                                            {errors.username && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.username}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Aksi Bawah */}
                                <div className="pt-4 border-t border-primary/5 mt-8 flex sm:flex-row flex-col gap-3">
                                    <button
                                        type="button"
                                        onClick={handlePrev}
                                        className="sm:flex-1 w-full flex items-center justify-center gap-2 bg-secondary/40 text-primary py-4 rounded-2xl hover:bg-secondary active:scale-[0.98] transition-all duration-300 font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-sm"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-1" />
                                        Sebelumnya
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="sm:flex-1 w-full flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all duration-300 font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                                    >
                                        Selanjutnya
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* -------------------- STEP 3 -------------------- */}
                        {step === 3 && (
                            <div className="space-y-6 animate-fade-in">
                                {/* Keamanan */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40 border-b border-primary/5 pb-2">Sistem Keamanan</h4>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Password Sistem</label>
                                            <div className="relative group">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={formState.password}
                                                    onChange={(e) => handleChange('password', e.target.value)}
                                                    placeholder="********"
                                                    className={`w-full px-5 py-4 pr-14 rounded-2xl bg-white border ${errors.password ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/10 focus:ring-primary/10'} outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm placeholder:text-primary/20`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-primary/40 hover:bg-gray-100 hover:text-primary transition-all active:scale-95 flex items-center justify-center cursor-pointer pointer-events-auto z-10"
                                                    tabIndex="-1"
                                                    title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5 flex-shrink-0" /> : <Eye className="w-5 h-5 flex-shrink-0" />}
                                                </button>
                                            </div>
                                            {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.password}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Aksi Bawah */}
                                <div className="pt-4 border-t border-primary/5 mt-8 flex sm:flex-row flex-col gap-3">
                                    <button
                                        type="button"
                                        onClick={handlePrev}
                                        className="sm:flex-1 w-full flex items-center justify-center gap-2 bg-secondary/40 text-primary py-4 rounded-2xl hover:bg-secondary active:scale-[0.98] transition-all duration-300 font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-sm"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-1" />
                                        Sebelumnya
                                    </button>
                                    <button
                                        type="submit"
                                        className="sm:flex-1 w-full flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all duration-300 font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        {isEdit ? 'Simpan Perubahan' : 'Tambahkan Karyawan'}
                                    </button>
                                </div>
                            </div>
                        )}

                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default StaffFormModal;
