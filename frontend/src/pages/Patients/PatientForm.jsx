import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../context/MockDataContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { User, Calendar, Hash, CreditCard, MapPin, Mail, Phone, Home } from 'lucide-react';
import CustomSelect from '../../components/UI/CustomSelect';
import { pasienAPI, wilayahAPI } from '../../services/api';

const PatientForm = () => {
    const { addPatient } = useMockData();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const [kabKotaOptions, setKabKotaOptions] = useState([]);
    const [kecamatanOptions, setKecamatanOptions] = useState([]);

    const [formData, setFormData] = useState({
        kodeCustomer: '',
        noMember: '',
        tipeMember: 'Non Member',
        noRM: '',
        namaLengkap: '',
        noIdentitas: '',
        tempatLahir: '',
        tanggalLahir: '',
        jenisKelamin: 'Laki-laki',
        alamat: '',
        kabupatenKota: '',
        kecamatan: '',
        email: '',
        noTelepon: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user?.token) {
            wilayahAPI.getKabKota(user.token).then(res => {
                if (res.success && res.data) {
                    const dataArray = Array.isArray(res.data) ? res.data : (res.data.data || []);
                    setKabKotaOptions(dataArray.map(item => ({
                        value: item.id,
                        label: item.nama || item.name || item.KabKota || item.kabupaten_kota || `Kab/Kota ${item.id}`
                    })));
                }
            });

            // Fetch auto-generated numbers for new patient
            pasienAPI.getNextNumbers(user.token).then(res => {
                if (res.success && res.data) {
                    setFormData(prev => ({
                        ...prev,
                        noRM: res.data.no_RM || res.data.no_rm || res.data.noRM || prev.noRM
                    }));
                }
            });
        }
    }, [user?.token]);

    useEffect(() => {
        if (formData.kabupatenKota && user?.token) {
            wilayahAPI.getKecamatan(user.token, formData.kabupatenKota).then(res => {
                if (res.success && res.data) {
                    const dataArray = Array.isArray(res.data) ? res.data : (res.data.data || []);
                    setKecamatanOptions(dataArray.map(item => ({
                        value: item.id,
                        label: item.nama || item.name || item.Kecamatan || item.kecamatan || `Kecamatan ${item.id}`
                    })));
                }
            });
        } else {
            setKecamatanOptions([]);
        }
    }, [formData.kabupatenKota, user?.token]);

    const validateForm = () => {
        let newErrors = {};

        if (!formData.namaLengkap.trim()) newErrors.namaLengkap = "Nama lengkap wajib diisi";

        if (!formData.noIdentitas.trim()) newErrors.noIdentitas = "No. Identitas wajib diisi";
        else if (!/^\d+$/.test(formData.noIdentitas)) newErrors.noIdentitas = "No. Identitas hanya boleh berisi angka";
        else if (formData.noIdentitas.length < 16) newErrors.noIdentitas = "No. Identitas minimal 16 karakter";

        if (!formData.tempatLahir.trim()) newErrors.tempatLahir = "Tempat lahir wajib diisi";
        
        if (!formData.tanggalLahir) newErrors.tanggalLahir = "Tanggal lahir wajib diisi";

        if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Format email tidak valid";
        }

        if (!formData.noTelepon.trim()) newErrors.noTelepon = "Nomor telepon wajib diisi";
        else if (!/^\d+$/.test(formData.noTelepon)) newErrors.noTelepon = "Nomor telepon hanya boleh berisi angka";

        if (!formData.alamat.trim()) newErrors.alamat = "Alamat lengkap wajib diisi";
        if (!formData.kabupatenKota) newErrors.kabupatenKota = "Kabupaten/Kota wajib dipilih";
        if (!formData.kecamatan) newErrors.kecamatan = "Kecamatan wajib dipilih";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsLoading(true);
            try {
                if (user?.token) {
                    const result = await pasienAPI.create(user.token, formData);
                    if (result.success) {
                        showToast('Pasien berhasil didaftarkan!', 'success');
                        navigate('/patients');
                    } else {
                        showToast(result.message || 'Gagal mendaftarkan pasien', 'error');
                    }
                } else {
                    addPatient(formData);
                    showToast('Pasien berhasil didaftarkan (Mock)!', 'success');
                    navigate('/patients');
                }
            } catch (error) {
                showToast('Gagal terhubung ke server', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    // Style seragam untuk input agar kode lebih rapi
    const inputWrapperClass = "relative group";
    const getInputClass = (hasError) => `w-full px-6 py-4 rounded-2xl bg-white border ${hasError ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/5 focus:ring-primary/5'} outline-none focus:ring-4 transition-all text-sm font-semibold text-primary`;
    const getInputWithIconClass = (hasError) => `w-full pl-12 pr-6 py-4 rounded-2xl bg-white border ${hasError ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/5 focus:ring-primary/5'} outline-none focus:ring-4 transition-all text-sm font-semibold text-primary`;
    const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30 group-focus-within:text-primary transition-colors";
    const labelClass = "text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] ml-1 mb-3 block";

    return (
        <div className="w-full mx-auto pb-12">
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/10 shadow-2xl shadow-primary/5 overflow-hidden animate-fade-in">
                <div className="p-8 md:p-12 border-b border-primary/5 bg-primary/5 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Registrasi Pasien</h2>
                        <p className="text-primary/40 mt-3 font-bold text-sm tracking-tight">Masukkan 10 data diri lengkap pasien baru</p>
                    </div>
                </div>

                    <form className="p-8 md:p-12 space-y-8" onSubmit={handleSubmit}>
                        
                        {/* Baris 1: No Member & No RM */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClass}>1. No. Member</label>
                                <div className={inputWrapperClass}>
                                    <Hash className={iconClass} />
                                    <input
                                        type="text"
                                        placeholder="Nomor Member"
                                        className={getInputWithIconClass(false)}
                                        value={formData.noMember}
                                        onChange={(e) => handleChange('noMember', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>2. No. RM (Rekam Medis)</label>
                                <div className={inputWrapperClass}>
                                    <Hash className={iconClass} />
                                    <input
                                        type="text"
                                        placeholder="Nomor Rekam Medis"
                                        className={`${getInputWithIconClass(false)} bg-secondary/30 text-primary/60 cursor-not-allowed`}
                                        value={formData.noRM}
                                        readOnly
                                        onChange={(e) => handleChange('noRM', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Baris 2: Nama Lengkap & No Identitas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClass}>3. Nama Lengkap</label>
                                <div className={inputWrapperClass}>
                                    <User className={iconClass} />
                                    <input
                                        type="text"
                                        placeholder="Nama Lengkap Pasien"
                                        className={getInputWithIconClass(errors.namaLengkap)}
                                        value={formData.namaLengkap}
                                        onChange={(e) => handleChange('namaLengkap', e.target.value)}
                                    />
                                </div>
                                {errors.namaLengkap && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1">{errors.namaLengkap}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>4. No. Identitas (KTP/Passport)</label>
                                <div className={inputWrapperClass}>
                                    <CreditCard className={iconClass} />
                                    <input
                                        type="text"
                                        placeholder="Nomor Identitas Diri"
                                        className={getInputWithIconClass(errors.noIdentitas)}
                                        value={formData.noIdentitas}
                                        onChange={(e) => handleChange('noIdentitas', e.target.value)}
                                    />
                                </div>
                                {errors.noIdentitas && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 animate-pulse">{errors.noIdentitas}</p>}
                            </div>
                        </div>

                        {/* Baris 3: Tempat & Tanggal Lahir */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClass}>5. Tempat Lahir</label>
                                <div className={inputWrapperClass}>
                                    <MapPin className={iconClass} />
                                    <input
                                        type="text"
                                        placeholder="Kota/Kabupaten Tempat Lahir"
                                        className={getInputWithIconClass(errors.tempatLahir)}
                                        value={formData.tempatLahir}
                                        onChange={(e) => handleChange('tempatLahir', e.target.value)}
                                    />
                                </div>
                                {errors.tempatLahir && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1">{errors.tempatLahir}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>6. Tanggal Lahir</label>
                                <div className={inputWrapperClass}>
                                    <Calendar className={iconClass} />
                                    <input
                                        type="date"
                                        className={getInputWithIconClass(errors.tanggalLahir)}
                                        value={formData.tanggalLahir}
                                        onChange={(e) => handleChange('tanggalLahir', e.target.value)}
                                    />
                                </div>
                                {errors.tanggalLahir && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1">{errors.tanggalLahir}</p>}
                            </div>
                        </div>

                        {/* Baris 4: Jenis Kelamin & Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClass}>7. Jenis Kelamin</label>
                                <CustomSelect 
                                    value={formData.jenisKelamin} 
                                    onChange={(value) => handleChange('jenisKelamin', value)}
                                    options={[
                                        { value: 'Laki-laki', label: 'Laki-laki' },
                                        { value: 'Perempuan', label: 'Perempuan' }
                                    ]}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>8. Email</label>
                                <div className={inputWrapperClass}>
                                    <Mail className={iconClass} />
                                    <input
                                        type="email"
                                        placeholder="alamat@email.com"
                                        className={getInputWithIconClass(errors.email)}
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1">{errors.email}</p>}
                            </div>
                        </div>

                        {/* Baris 5: Telepon (Full width di mobile, half di md) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClass}>9. No. Telepon / WhatsApp</label>
                                <div className={inputWrapperClass}>
                                    <Phone className={iconClass} />
                                    <input
                                        type="tel"
                                        placeholder="081234567890"
                                        className={getInputWithIconClass(errors.noTelepon)}
                                        value={formData.noTelepon}
                                        onChange={(e) => handleChange('noTelepon', e.target.value)}
                                    />
                                </div>
                                {errors.noTelepon && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 animate-pulse">{errors.noTelepon}</p>}
                            </div>
                        </div>

                        {/* Baris 6: Alamat */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClass}>10. Kabupaten/Kota</label>
                                <CustomSelect 
                                    value={formData.kabupatenKota} 
                                    onChange={(value) => {
                                        handleChange('kabupatenKota', value);
                                        handleChange('kecamatan', ''); // reset kecamatan
                                    }}
                                    placeholder={kabKotaOptions.length > 0 ? "Pilih Kabupaten/Kota" : "Memuat..."}
                                    searchable={true}
                                    options={kabKotaOptions}
                                />
                                {errors.kabupatenKota && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1">{errors.kabupatenKota}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>11. Kecamatan</label>
                                <CustomSelect 
                                    value={formData.kecamatan} 
                                    onChange={(value) => handleChange('kecamatan', value)}
                                    placeholder={
                                        !formData.kabupatenKota 
                                        ? "Pilih Kab/Kota dahulu" 
                                        : (kecamatanOptions.length > 0 ? "Pilih Kecamatan" : "Memuat...")
                                    }
                                    searchable={true}
                                    options={kecamatanOptions}
                                    disabled={!formData.kabupatenKota}
                                />
                                {errors.kecamatan && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1">{errors.kecamatan}</p>}
                            </div>
                        </div>

                        {/* Baris 7: Detail Alamat */}
                        <div>
                            <label className={labelClass}>12. Detail Alamat</label>
                            <textarea
                                rows="3"
                                placeholder="Detail alamat domisili pasien..."
                                className={`${getInputClass(errors.alamat)} resize-none`}
                                value={formData.alamat}
                                onChange={(e) => handleChange('alamat', e.target.value)}
                            />
                            {errors.alamat && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1">{errors.alamat}</p>}
                        </div>

                        {/* Tombol Aksi */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4 sm:gap-6 pt-8 border-t border-primary/5">
                            <button
                                type="button"
                                onClick={() => navigate('/patients')}
                                className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary/40 hover:bg-primary/5 transition-all duration-300 active:scale-95 text-center order-2 sm:order-1"
                            >
                                Batal
                            </button>
                            <button type="submit" className="bg-primary text-secondary px-10 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 order-1 sm:order-2">
                                Daftarkan Pasien
                            </button>
                        </div>
                    </form>
            </div>
        </div>
    );
};

export default PatientForm;