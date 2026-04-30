import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Package, Activity, Beaker } from 'lucide-react';
import CustomSelect from './CustomSelect';
import CustomMultiSelect from './CustomMultiSelect';
import { useMockData } from '../../context/MockDataContext';

const WarehouseFormModal = ({ isOpen, onClose, onSave, initialData, type }) => {
    const { materials } = useMockData();
    const [formState, setFormState] = useState({
        name: '',
        category: type === 'product' ? 'Obat' : type === 'racikan' ? 'Racikan' : type === 'material' ? 'Bahan' : 'Treatment',
        price: '',
        stock: '',
        minStock: '',
        bahan_ids: [],
        id: '',
        isPackage: false,
        packageCount: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            if (initialData) {
                setFormState({
                    ...initialData,
                    bahan_ids: initialData.bahan_ids || [],
                    isPackage: initialData.isPackage || false,
                    packageCount: initialData.packageCount || '',
                    id: initialData.id || ''
                });
            } else {
                setFormState({
                    name: '',
                    category: type === 'product' ? 'Obat' : type === 'racikan' ? 'Racikan' : type === 'material' ? 'Bahan' : 'Treatment',
                    price: '',
                    stock: '',
                    minStock: '',
                    bahan_ids: [],
                    id: '',
                    isPackage: false,
                    packageCount: ''
                });
            }
        }
    }, [isOpen, initialData, type]);

    if (!isOpen) return null;

    const validate = () => {
        let newErrors = {};
        const typeLabel = type === 'product' ? 'stok' : type === 'racikan' ? 'racikan' : type === 'material' ? 'bahan' : 'treatment';
        if (!formState.name.trim()) newErrors.name = `Nama ${typeLabel} wajib diisi`;
        
        if (type === 'product' || type === 'racikan' || type === 'material') {
            if (!formState.category) newErrors.category = "Kategori wajib dipilih";
            if (formState.price === '' || formState.price === null) newErrors.price = "Harga wajib diisi";
            if (formState.stock === '' || formState.stock === null) newErrors.stock = "Stok wajib diisi";
            if (formState.minStock === '' || formState.minStock === null) newErrors.minStock = "Batas minimal stok wajib diisi";
        } else {
            if (formState.price === '' || formState.price === null) newErrors.price = "Harga wajib diisi";
            if (formState.isPackage && (!formState.packageCount || formState.packageCount <= 0)) {
                newErrors.packageCount = "Jumlah paket wajib diisi";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSave(formState);
        }
    };

    const handleChange = (field, value) => {
        setFormState(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const getDynamicInputClass = (field) => {
        return `w-full px-4 py-4 rounded-2xl bg-white border ${errors[field] ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/5 focus:ring-primary/5'} outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm`;
    };

    const labelClassName = "text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1 block mb-2";

    const materialOptions = materials.map(m => ({
        value: m.id,
        label: `${m.name} (${m.stock} unit)`
    }));

    return createPortal(
        <div 
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/30"
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

                {/* Header Section */}
                <div className="relative p-8 pb-6 bg-primary overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>

                    <div className="relative z-10 flex items-center gap-4 pr-12">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-secondary backdrop-blur-sm border border-white/10">
                            {type === 'product' ? <Package className="w-6 h-6" /> : type === 'material' ? <Beaker className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                                {initialData ? 'Edit' : 'Tambah'} {type === 'product' ? 'Stok' : type === 'racikan' ? 'Racikan' : type === 'material' ? 'Bahan' : 'Treatment'}
                            </h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                Formulir Data Master
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="p-8 border-t-[0.5px] border-primary/5 max-h-[70vh] overflow-y-auto scrollbar-hide">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className={labelClassName}>Kode {type === 'product' ? 'Stok' : type === 'racikan' ? 'Racikan' : type === 'material' ? 'Bahan' : 'Treatment'}</label>
                            <input
                                type="text"
                                value={formState.id}
                                onChange={(e) => handleChange('id', e.target.value)}
                                className={getDynamicInputClass('id')}
                                placeholder={`Contoh: ${type === 'product' ? 'PRD-001' : type === 'racikan' ? 'RCK-001' : type === 'material' ? 'MAT-001' : 'TRT-001'}`}
                            />
                            {errors.id && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.id}</p>}
                        </div>
                        
                        <div>
                            <label className={labelClassName}>Nama {type === 'product' ? 'Stok' : type === 'racikan' ? 'Racikan' : type === 'material' ? 'Bahan' : 'Treatment'}</label>
                            <input
                                type="text"
                                value={formState.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className={getDynamicInputClass('name')}
                                placeholder={`Masukkan nama ${type === 'product' ? 'stok' : type === 'racikan' ? 'racikan' : type === 'material' ? 'bahan' : 'treatment'}...`}
                            />
                            {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.name}</p>}
                        </div>

                        {type === 'treatment' && (
                            <>
                                <div className="p-4 rounded-2xl border border-primary/5 bg-gray-50/50 space-y-4">
                                    <label className="flex items-center gap-3 cursor-pointer group w-max">
                                        <div className="relative flex items-center justify-center">
                                            <input 
                                                type="checkbox" 
                                                className="peer appearance-none w-5 h-5 border-2 border-primary/20 rounded-md checked:bg-green-500 checked:border-green-500 transition-all cursor-pointer group-hover:border-primary/40"
                                                checked={formState.isPackage}
                                                onChange={(e) => handleChange('isPackage', e.target.checked)}
                                            />
                                            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-primary/60 group-hover:text-primary transition-colors">
                                            Treatment ini merupakan paket
                                        </span>
                                    </label>

                                    {formState.isPackage && (
                                        <div className="pt-2 animate-fade-in-up">
                                            <label className={labelClassName}>Jumlah Treatment Dalam Paket</label>
                                            <input
                                                type="number"
                                                value={formState.packageCount}
                                                onChange={(e) => handleChange('packageCount', e.target.value === '' ? '' : Number(e.target.value))}
                                                className={getDynamicInputClass('packageCount')}
                                                placeholder="Contoh: 5"
                                                min="1"
                                            />
                                            {errors.packageCount && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.packageCount}</p>}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <CustomMultiSelect
                                        label="Bahan yang digunakan"
                                        placeholder="Pilih bahan..."
                                        values={formState.bahan_ids}
                                        onChange={(val) => handleChange('bahan_ids', val)}
                                        options={materialOptions}
                                        searchable={true}
                                    />
                                    <p className="text-[9px] font-bold text-primary/30 mt-2 px-1">Pilih satu atau lebih bahan yang dihabiskan dalam sesi treatment ini.</p>
                                </div>
                            </>
                        )}

                        <div className={(type === 'product' || type === 'racikan' || type === 'material') ? "grid grid-cols-2 gap-4" : "block"}>
                            {(type === 'product' || type === 'racikan' || type === 'material') && (
                                <div>
                                    <CustomSelect
                                        label="Kategori"
                                        value={formState.category}
                                        onChange={(value) => handleChange('category', value)}
                                        options={type === 'product' ? [
                                            { value: 'Obat', label: 'Obat' },
                                            { value: 'Skincare', label: 'Skincare' },
                                            { value: 'Lainnya', label: 'Lainnya' },
                                        ] : type === 'material' ? [
                                            { value: 'Bahan Habis Pakai', label: 'Habis Pakai' },
                                            { value: 'Alat Medis', label: 'Alat Medis' },
                                            { value: 'Cairan', label: 'Cairan' },
                                        ] : [
                                            { value: 'Racikan', label: 'Racikan Khusus' }
                                        ]}
                                    />
                                    {errors.category && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.category}</p>}
                                </div>
                            )}
                            
                            <div>
                                <label className={labelClassName}>Harga (Rp)</label>
                                <input
                                    type="number"
                                    value={formState.price}
                                    onChange={(e) => handleChange('price', e.target.value === '' ? '' : Number(e.target.value))}
                                    className={getDynamicInputClass('price')}
                                    placeholder="0"
                                />
                                {errors.price && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.price}</p>}
                            </div>
                        </div>

                        {(type === 'product' || type === 'racikan' || type === 'material') && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClassName}>Stok Tersedia</label>
                                    <input
                                        type="number"
                                        value={formState.stock}
                                        onChange={(e) => handleChange('stock', e.target.value === '' ? '' : Number(e.target.value))}
                                        className={getDynamicInputClass('stock')}
                                        placeholder="0"
                                    />
                                    {errors.stock && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.stock}</p>}
                                </div>
                                <div>
                                    <label className={labelClassName}>Batas Minimal Stok</label>
                                    <input
                                        type="number"
                                        value={formState.minStock}
                                        onChange={(e) => handleChange('minStock', e.target.value === '' ? '' : Number(e.target.value))}
                                        className={getDynamicInputClass('minStock')}
                                        placeholder="5"
                                    />
                                    {errors.minStock && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.minStock}</p>}
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="w-full flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 mt-4"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Simpan Data
                        </button>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default WarehouseFormModal;