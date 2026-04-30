import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Tag } from 'lucide-react';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rbac';
import { useMockData } from '../../context/MockDataContext';
import { Search } from 'lucide-react';

const PromoFormModal = ({ isOpen, onClose, onSave, initialData }) => {
    const { user } = useAuth();
    const { products, treatments } = useMockData();
    const isSupervisorTreatment = user?.role === ROLES.SUPERVISOR_TREATMENT;
    const isSupervisorProduk = user?.role === ROLES.SUPERVISOR_PRODUK;

    const [formState, setFormState] = useState({
        name: '',
        code: '',
        type: 'Persen',
        value: '',
        quota: '',
        startDate: '',
        endDate: '',
        category: 'Treatment',
        targetItems: []
    });

    const [itemSearch, setItemSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormState({
                    ...initialData,
                    targetItems: initialData.targetItems || []
                });
            } else {
                setFormState({
                    name: '',
                    code: '',
                    type: 'Persen',
                    value: '',
                    quota: '',
                    startDate: '',
                    endDate: '',
                    category: isSupervisorTreatment ? 'Treatment' : (isSupervisorProduk ? 'Produk' : 'Treatment'),
                    targetItems: []
                });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formState);
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30"
            onClick={onClose} // Klik background gelap untuk tutup
        >
            <div 
                className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal ikut menutup modal
            >
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClose();
                    }}
                    className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/40 hover:scale-105 active:scale-95 transition-all z-[60] shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header Modal */}
                <div className="relative p-8 pb-6 bg-primary overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10 z-0">
                        <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>

                    <div className="relative z-10 flex items-center gap-4 pr-12"> {/* pr-12 agar teks tidak menabrak tombol X */}
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-secondary backdrop-blur-sm border border-white/10 shrink-0">
                            <Tag className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                                {initialData ? 'Edit Promo' : 'Buat Promo Baru'}
                            </h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                Formulir Pengaturan Data Diskon
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Body / Form */}
                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Nama Promo</label>
                            <input 
                                required 
                                type="text" 
                                placeholder="Contoh: Diskon Ramadhan" 
                                value={formState.name}
                                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" 
                            />
                        </div>

                        {!(isSupervisorTreatment || isSupervisorProduk) && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Kategori Promo</label>
                                <CustomSelect 
                                    value={formState.category}
                                    onChange={(val) => setFormState({ ...formState, category: val })}
                                    options={[
                                        { value: 'Treatment', label: 'Treatment' },
                                        { value: 'Produk', label: 'Produk' }
                                    ]}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Kode Promo</label>
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="RAMADHAN50" 
                                    value={formState.code}
                                    onChange={(e) => setFormState({ ...formState, code: e.target.value.toUpperCase() })}
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all uppercase shadow-sm" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Tipe Diskon</label>
                                <CustomSelect 
                                    value={formState.type}
                                    onChange={(val) => setFormState({ ...formState, type: val })}
                                    options={[
                                        { value: 'Persen', label: 'Persentase (%)' },
                                        { value: 'Nominal', label: 'Nominal (Rp)' }
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Nilai Diskon</label>
                                <input 
                                    required 
                                    type="number" 
                                    placeholder={formState.type === 'Persen' ? 'Contoh: 50' : 'Contoh: 50000'}
                                    value={formState.value}
                                    onChange={(e) => setFormState({ ...formState, value: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Batas Kuota</label>
                                <input 
                                    required 
                                    type="number" 
                                    placeholder="Contoh: 100" 
                                    value={formState.quota}
                                    onChange={(e) => setFormState({ ...formState, quota: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <CustomDatePicker
                                label="Mulai Berlaku"
                                value={formState.startDate}
                                onChange={(val) => setFormState({ ...formState, startDate: val })}
                                className="w-full"
                            />
                            <CustomDatePicker
                                label="Berakhir"
                                value={formState.endDate}
                                onChange={(val) => setFormState({ ...formState, endDate: val })}
                                className="w-full"
                            />
                        </div>

                        {/* Item Selection Section */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">
                                Pilih {formState.category === 'Treatment' ? 'Treatment' : 'Produk'} yang mendapatkan Promo
                            </label>
                            <div className="relative group mb-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/30" />
                                <input 
                                    type="text"
                                    placeholder={`Cari ${formState.category.toLowerCase()}...`}
                                    value={itemSearch}
                                    onChange={(e) => setItemSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary/10 border border-primary/5 outline-none text-xs text-primary font-bold placeholder:text-primary/20 focus:ring-2 focus:ring-primary/5 transition-all"
                                />
                            </div>
                            <div className="max-h-48 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                                {(formState.category === 'Treatment' ? treatments : products)
                                    .filter(item => item.name.toLowerCase().includes(itemSearch.toLowerCase()))
                                    .map(item => (
                                        <label key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/[0.02] cursor-pointer border border-transparent hover:border-primary/5 transition-all group">
                                            <input 
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                checked={formState.targetItems.includes(item.name)}
                                                onChange={(e) => {
                                                    const newTargets = e.target.checked 
                                                        ? [...formState.targetItems, item.name]
                                                        : formState.targetItems.filter(t => t !== item.name);
                                                    setFormState({ ...formState, targetItems: newTargets });
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-primary truncate tracking-tight">{item.name}</p>
                                                <p className="text-[8px] font-bold text-primary/30 uppercase tracking-widest">{item.id}</p>
                                            </div>
                                            <span className="text-[10px] font-bold text-primary/60">Rp {item.price.toLocaleString('id-ID')}</span>
                                        </label>
                                    ))
                                }
                            </div>
                            {formState.targetItems.length > 0 && (
                                <div className="p-3 bg-primary/5 rounded-xl border border-primary/5">
                                    <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest mb-2">Item Terpilih ({formState.targetItems.length})</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {formState.targetItems.map(item => (
                                            <span key={item} className="px-2.5 py-1 bg-white border border-primary/10 rounded-lg text-[9px] font-bold text-primary shadow-sm flex items-center gap-1">
                                                {item}
                                                <X 
                                                    className="w-2.5 h-2.5 cursor-pointer hover:text-red-500" 
                                                    onClick={() => setFormState({ ...formState, targetItems: formState.targetItems.filter(t => t !== item) })}
                                                />
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <button 
                            type="submit" 
                            className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Simpan Promo
                        </button>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PromoFormModal;