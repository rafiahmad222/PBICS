import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Activity, Stethoscope, FileText, Package, FlaskConical, Pill, User, ArrowRight, ArrowLeft, Heart, History, ListChecks } from 'lucide-react';
import CustomSelect from './CustomSelect';
import CustomMultiSelect from './CustomMultiSelect';
import CustomDatePicker from './CustomDatePicker';
import ImageUpload from './ImageUpload';
import ConfirmModal from './ConfirmModal';

import { useMockData } from '../../context/MockDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const MedicalRecordFormModal = ({ isOpen, onClose, patientId = null, patientName = null }) => {
    const { patients, products, racikans, treatments, staff, addRecord } = useMockData();
    const { user } = useAuth();
    const { showToast } = useToast();

    // Form State
    const [step, setStep] = useState(1);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    
    // Assessment Step 1 fields
    const [perawatanSebelumnya, setPerawatanSebelumnya] = useState('');
    const [diinginkan, setDiinginkan] = useState([]);
    const [diinginkanLainnya, setDiinginkanLainnya] = useState('');
    const [tensi, setTensi] = useState('Normal');
    const [riwayatKesehatan, setRiwayatKesehatan] = useState([]);
    const [riwayatKesehatanLainnya, setRiwayatKesehatanLainnya] = useState('');

    // Procedure Step 2 fields
    const [selectedTreatments, setSelectedTreatments] = useState([]);
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedRacikans, setSelectedRacikans] = useState([]);
    const [beforeImage, setBeforeImage] = useState(null);
    const [afterImage, setAfterImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [confirmConfig, setConfirmConfig] = useState(null);


    // Options mapping
    const doctorOptions = staff
        .filter(s => s.divisi === 'Dokter')
        .map(s => ({ value: s.id, label: s.name }));
    
    const patientOptions = patients.map(p => ({ value: p.id, label: `${p.name} (${p.id})` }));
    const treatmentOptions = treatments.map(t => ({ value: t.id, label: t.name }));
    const productOptions = products.map(p => ({ value: p.id, label: `${p.name} (${p.category})` }));
    const racikanOptions = racikans.map(r => ({ value: r.id, label: r.name }));

    // Reset and auto-fill logic
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSelectedPatientId(patientId || '');
            setDate(new Date().toISOString().split('T')[0]);
            
            // Auto-fill doctor if current user is a doctor
            if (user?.role === 'Dokter') {
                const doc = staff.find(s => s.name === user?.name || s.username === user?.username);
                setSelectedDoctorId(doc?.id || '');
            } else {
                setSelectedDoctorId('');
            }

            setPerawatanSebelumnya('');
            setDiinginkan([]);
            setDiinginkanLainnya('');
            setTensi('Normal');
            setRiwayatKesehatan([]);
            setRiwayatKesehatanLainnya('');

            setSelectedTreatments([]);
            setDiagnosis('');
            setNotes('');
            setSelectedProducts([]);
            setSelectedRacikans([]);
            setBeforeImage(null);
            setAfterImage(null);
            setErrors({});
        }
    }, [isOpen, patientId, user, staff]);

    if (!isOpen) return null;

    const validateStep1 = () => {
        const newErrors = {};
        if (!patientId && !selectedPatientId) newErrors.patient = 'Pilih pasien terlebih dahulu';
        if (!selectedDoctorId) newErrors.doctor = 'Pilih dokter terlebih dahulu';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (selectedTreatments.length === 0) newErrors.treatments = 'Pilih minimal satu tipe perawatan';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateStep2()) return;

        setConfirmConfig({
            icon: 'save',
            header: 'Simpan Rekam Medis',
            message: `Simpan data rekam medis untuk ${patientName || 'pasien'}?`,
            acceptLabel: 'Ya, Simpan',
            onAccept: () => {
                const doctor = staff.find(s => s.id === selectedDoctorId);
                const treatmentLabels = selectedTreatments
                    .map(id => treatments.find(t => t.id === id)?.name)
                    .filter(Boolean);

                const prescriptions = [
                    ...selectedProducts.map(id => {
                        const p = products.find(x => x.id === id);
                        return p ? { name: p.name, dosage: 'Sesuai anjuran' } : null;
                    }).filter(Boolean),
                    ...selectedRacikans.map(id => {
                        const r = racikans.find(x => x.id === id);
                        return r ? { name: r.name, dosage: 'Racikan — sesuai anjuran' } : null;
                    }).filter(Boolean),
                ];

                const newRecord = {
                    id: Date.now(),
                    date,
                    treatment: treatmentLabels.join(', '),
                    specialist: doctor?.name || 'Unknown',
                    diagnosis,
                    notes,
                    prescriptions,
                    assessment: {
                        perawatanSebelumnya,
                        diinginkan,
                        diinginkanLainnya: diinginkan.includes('Lainnya') ? diinginkanLainnya : null,
                        tensi,
                        riwayatKesehatan,
                        riwayatKesehatanLainnya: riwayatKesehatan.includes('Lainnya') ? riwayatKesehatanLainnya : null,
                    },
                    beforeImage: beforeImage ? URL.createObjectURL(beforeImage) : null,
                    afterImage: afterImage ? URL.createObjectURL(afterImage) : null,
                };

                addRecord(patientId || selectedPatientId, newRecord);
                showToast('Rekam medis berhasil ditambahkan!', 'success');
                onClose();
            }
        });
    };


    const toggleItem = (list, setList, item) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const labelClass = "text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1 block mb-2";

    return createPortal(
        <div 
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/30"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
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
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                                Rekam Medis
                            </h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                Langkah {step} dari 2 • {step === 1 ? 'Asesmen & Riwayat' : 'Diagnosis & Tindakan'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    {/* Progress Bar */}
                    <div className="px-8 pt-8 pb-2 flex gap-2 shrink-0">
                        <div className="h-1.5 flex-1 rounded-full bg-primary/10 overflow-hidden">
                            <div className={`h-full bg-primary transition-all duration-500 ${step >= 1 ? 'w-full' : 'w-0'}`} />
                        </div>
                        <div className="h-1.5 flex-1 rounded-full bg-primary/10 overflow-hidden">
                            <div className={`h-full bg-primary transition-all duration-500 ${step >= 2 ? 'w-full' : 'w-0'}`} />
                        </div>
                    </div>

                    <div className="p-8 overflow-y-auto scrollbar-hide flex-1">
                        <form onSubmit={handleSubmit} className="space-y-8 min-h-full flex flex-col">
                            
                            {step === 1 && (
                                <div className="space-y-8 animate-fade-in flex flex-col flex-1">
                                    {/* Patient Info */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 border-b border-primary/5 pb-2">
                                            <User className="w-4 h-4 text-primary/30" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Informasi Kunjungan</h4>
                                        </div>

                                        {!patientId && (
                                            <div className="relative group">
                                                <CustomSelect
                                                    label="Nama Pasien"
                                                    options={patientOptions}
                                                    value={selectedPatientId}
                                                    onChange={setSelectedPatientId}
                                                    placeholder="Pilih pasien..."
                                                    searchable={true}
                                                    icon={User}
                                                />
                                                {errors.patient && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.patient}</p>}
                                            </div>
                                        )}
                                    
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <CustomDatePicker
                                                label="Tanggal Kunjungan"
                                                value={date}
                                                onChange={setDate}
                                                required
                                            />
                                            <div>
                                                <CustomSelect
                                                    label="Dokter / Spesialis"
                                                    options={doctorOptions}
                                                    value={selectedDoctorId}
                                                    onChange={setSelectedDoctorId}
                                                    placeholder="Pilih dokter..."
                                                    searchable={true}
                                                    icon={Stethoscope}
                                                />
                                                {errors.doctor && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.doctor}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Riwayat Kesehatan Image 3 */}
                                    <div className="space-y-6 pt-2">
                                        <div className="flex items-center gap-3 border-b border-primary/5 pb-2">
                                            <Heart className="w-4 h-4 text-primary/30" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Riwayat Kesehatan & Kontra Indikasi</h4>
                                        </div>

                                        {/* Blood Pressure */}
                                        <div>
                                            <label className={labelClass}>Tekanan Darah</label>
                                            <div className="flex gap-2 p-1 bg-secondary/30 rounded-2xl w-fit">
                                                {['Rendah', 'Normal', 'Tinggi'].map((t) => (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() => setTensi(t)}
                                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tensi === t ? 'bg-primary text-secondary shadow-lg' : 'text-primary/40 hover:bg-primary/5'}`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Conditions checkboxes */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
                                            {['Kanker', 'Keloid', 'HIV / AIDS', 'Stroke', 'Epilepsi', 'Diabetes', 'Lainnya'].map((condition) => (
                                                <button
                                                    key={condition}
                                                    type="button"
                                                    onClick={() => toggleItem(riwayatKesehatan, setRiwayatKesehatan, condition)}
                                                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${riwayatKesehatan.includes(condition) ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-primary/5 bg-white hover:border-primary/20'}`}
                                                >
                                                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${riwayatKesehatan.includes(condition) ? 'bg-primary border-primary' : 'border-primary/10'}`}>
                                                        {riwayatKesehatan.includes(condition) && <CheckCircle2 className="w-3 h-3 text-secondary" />}
                                                    </div>
                                                    <span className={`text-[10px] font-black uppercase tracking-tighter ${riwayatKesehatan.includes(condition) ? 'text-primary' : 'text-primary/40'}`}>
                                                        {condition}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                        {riwayatKesehatan.includes('Lainnya') && (
                                            <input
                                                type="text"
                                                value={riwayatKesehatanLainnya}
                                                onChange={(e) => setRiwayatKesehatanLainnya(e.target.value)}
                                                placeholder="Sebutkan riwayat kesehatan lainnya..."
                                                className="w-full px-5 py-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-primary shadow-sm placeholder:text-primary/20 animate-fade-in"
                                            />
                                        )}
                                    </div>

                                    {/* Perawatan Image 1 & 2 */}
                                    <div className="space-y-6 pt-2">
                                        <div className="flex items-center gap-3 border-b border-primary/5 pb-2">
                                            <History className="w-4 h-4 text-primary/30" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Riwayat & Tujuan Perawatan</h4>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Perawatan di Klinik Sebelumnya?</label>
                                            <input
                                                type="text"
                                                value={perawatanSebelumnya}
                                                onChange={(e) => setPerawatanSebelumnya(e.target.value)}
                                                placeholder="Contoh: Belum pernah / New Customer..."
                                                className="w-full px-5 py-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium text-primary shadow-sm placeholder:text-primary/20"
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}>Perawatan yang Diinginkan</label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
                                                {['Laser / IPL', 'Dermaroller', 'PRP', 'Botox', 'Lainnya'].map((item) => (
                                                    <button
                                                        key={item}
                                                        type="button"
                                                        onClick={() => toggleItem(diinginkan, setDiinginkan, item)}
                                                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${diinginkan.includes(item) ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-primary/5 bg-white hover:border-primary/20'}`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${diinginkan.includes(item) ? 'bg-primary border-primary' : 'border-primary/10'}`}>
                                                            {diinginkan.includes(item) && <CheckCircle2 className="w-3 h-3 text-secondary" />}
                                                        </div>
                                                        <span className={`text-[10px] font-black uppercase tracking-tighter ${diinginkan.includes(item) ? 'text-primary' : 'text-primary/40'}`}>
                                                            {item}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                            {diinginkan.includes('Lainnya') && (
                                                <input
                                                    type="text"
                                                    value={diinginkanLainnya}
                                                    onChange={(e) => setDiinginkanLainnya(e.target.value)}
                                                    placeholder="Sebutkan perawatan lainnya..."
                                                    className="w-full px-5 py-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-primary shadow-sm placeholder:text-primary/20 mt-4 animate-fade-in"
                                                />
                                            )}
                                        </div>

                                        {/* Step 1 Actions */}
                                        <div className="pt-6 mt-auto">
                                            <button
                                                type="button"
                                                onClick={handleNext}
                                                className="w-full flex items-center justify-center gap-3 bg-primary text-secondary py-4 rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                                            >
                                                Lanjut ke Diagnosis
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                                {step === 2 && (
                                    <div className="space-y-8 animate-fade-in flex flex-col flex-1">
                                        {/* Tipe Perawatan */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-b border-primary/5 pb-2">
                                                <ListChecks className="w-4 h-4 text-primary/30" />
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Tindakan Medis</h4>
                                            </div>

                                            <div>
                                                <CustomMultiSelect
                                                    label="Tipe Perawatan"
                                                    placeholder="Cari & pilih perawatan..."
                                                    values={selectedTreatments}
                                                    onChange={setSelectedTreatments}
                                                    options={treatmentOptions}
                                                    searchable={true}
                                                    icon={Activity}
                                                />
                                                {errors.treatments && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.treatments}</p>}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className={labelClass}>Diagnosa / Observasi</label>
                                                    <textarea
                                                        value={diagnosis}
                                                        onChange={(e) => setDiagnosis(e.target.value)}
                                                        placeholder="Hasil observasi detail..."
                                                        className="w-full p-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all h-32 resize-none text-sm font-medium text-primary placeholder:text-primary/20 shadow-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Catatan Tindakan</label>
                                                    <textarea
                                                        value={notes}
                                                        onChange={(e) => setNotes(e.target.value)}
                                                        placeholder="Prosedur, feedback pasien, dll..."
                                                        className="w-full p-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all h-32 resize-none text-sm font-medium text-primary placeholder:text-primary/20 shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Resep / Stok */}
                                        <div className="bg-secondary/30 rounded-[2rem] p-6 space-y-6 border border-primary/5">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Pill className="w-4 h-4 text-primary/40" />
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Resep / Stok Mandiri</span>
                                            </div>
                                            
                                            <CustomMultiSelect
                                                label="Stok (Obat / Skincare)"
                                                placeholder="Cari & pilih stok..."
                                                values={selectedProducts}
                                                onChange={setSelectedProducts}
                                                options={productOptions}
                                                searchable={true}
                                                icon={Package}
                                            />

                                            <CustomMultiSelect
                                                label="Racikan"
                                                placeholder="Cari & pilih racikan..."
                                                values={selectedRacikans}
                                                onChange={setSelectedRacikans}
                                                options={racikanOptions}
                                                searchable={true}
                                                icon={FlaskConical}
                                            />
                                        </div>

                                        {/* Foto */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-b border-primary/5 pb-2">
                                                <Activity className="w-4 h-4 text-primary/30" />
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Dokumentasi Foto</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <ImageUpload label="Sebelum" onImageChange={setBeforeImage} />
                                                <ImageUpload label="Sesudah" onImageChange={setAfterImage} />
                                            </div>
                                        </div>

                                        {/* Step 2 Actions */}
                                        <div className="flex gap-4 pt-8 mt-auto">
                                            <button
                                                type="button"
                                                onClick={handleBack}
                                                className="flex-1 flex items-center justify-center gap-2 bg-secondary text-primary py-4 rounded-2xl hover:bg-white active:scale-[0.98] transition-all duration-300 font-black text-xs uppercase tracking-widest border border-primary/5 shadow-sm"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Kembali
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-[2] flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-2xl hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                Simpan Rekam Medis
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
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


export default MedicalRecordFormModal;
