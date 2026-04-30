import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Package, Beaker } from 'lucide-react';
import CustomSelect from './CustomSelect';

const ApotekerFormModal = ({ isOpen, onClose, onSave, initialData, type }) => {
    const [formState, setFormState] = useState({
        name: '',
        category: '',
        stock: '',
        minStock: '',
        id: ''
    });
    
    // Warn inputs specific to Apoteker requirement.
    const [errors, setErrors] = useState({});

    // type: 'material', 'medical', 'infusion', 'apotekItem'

    const getTypeLabel = () => {
        if (type === 'material') return 'bahan treatment';
        if (type === 'medical') return 'bahan medis';
        if (type === 'infusion') return 'bahan infus';
        if (type === 'apotekItem') return 'barang apotek';
        return 'item';
    };

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            if (initialData) {
                setFormState({
                    name: initialData.name || '',
                    category: initialData.category || '',
                    stock: initialData.stock !== undefined ? initialData.stock : '',
                    minStock: initialData.minStock !== undefined ? initialData.minStock : '',
                    id: initialData.id || ''
                });
            } else {
                setFormState({
                    name: '',
                    category: '',
                    stock: '',
                    minStock: '',
                    id: ''
                });
            }
        }
    }, [isOpen, initialData, type]);

    if (!isOpen) return null;

    const validate = () => {
        let newErrors = {};
        const typeLabel = getTypeLabel();
        
        if (!formState.name || !formState.name.trim()) newErrors.name = `Nama ${typeLabel} wajib diisi`;
        if (formState.stock === '' || formState.stock === null) newErrors.stock = "Stok wajib diisi";
        if (formState.minStock === '' || formState.minStock === null) newErrors.minStock = "Batas minimal stok wajib diisi";
        if (!formState.category) newErrors.category = "Kategori wajib diisi";

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

    const getCategoryOptions = () => {
        if (type === 'material') {
            return [
                { value: 'Bahan Habis Pakai', label: 'Bahan Habis Pakai' },
                { value: 'Alat Medis', label: 'Alat Medis' },
                { value: 'Cairan', label: 'Cairan' },
            ];
        }
        if (type === 'medical') {
            return [
                { value: 'Alat Kesehatan', label: 'Alat Kesehatan' },
                { value: 'Peralatan Medis', label: 'Peralatan Medis' }
            ];
        }
        if (type === 'infusion') {
            return [
                { value: 'Cairan Infus', label: 'Cairan Infus' },
                { value: 'Alat Infus', label: 'Alat Infus' }
            ];
        }
        if (type === 'apotekItem') {
            return [
                { value: 'Habis Pakai', label: 'Habis Pakai' },
                { value: 'Obat Bebas', label: 'Obat Bebas' },
                { value: 'Lainnya', label: 'Lainnya' }
            ];
        }
        return [{ value: 'Umum', label: 'Umum' }];
    };

    const titleType = getTypeLabel()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return createPortal(
        <div 
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/30 animate-fade-in"
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
                            {type === 'apotekItem' ? <Package className="w-6 h-6" /> : <Beaker className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                                {initialData ? 'Edit' : 'Tambah'} {titleType}
                            </h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                Formulir Stok Apotek
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="p-8 border-t-[0.5px] border-primary/5 max-h-[70vh] overflow-y-auto scrollbar-hide">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className={labelClassName}>Kode {titleType}</label>
                            <input
                                type="text"
                                value={formState.id}
                                onChange={(e) => handleChange('id', e.target.value)}
                                className={getDynamicInputClass('id')}
                                placeholder="Dikosongkan untuk auto-generate..."
                            />
                            {/* Not strictly required, so no error mostly but we can show formatting */}
                        </div>
                        
                        <div>
                            <label className={labelClassName}>Nama {titleType}</label>
                            <input
                                type="text"
                                value={formState.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className={getDynamicInputClass('name')}
                                placeholder={`Masukkan nama ${getTypeLabel()}...`}
                            />
                            {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.name}</p>}
                        </div>

                        <div>
                            <CustomSelect
                                label="Kategori"
                                value={formState.category}
                                onChange={(value) => handleChange('category', value)}
                                options={getCategoryOptions()}
                            />
                            {errors.category && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.category}</p>}
                        </div>

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

export default ApotekerFormModal;
