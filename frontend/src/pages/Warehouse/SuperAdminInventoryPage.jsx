import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit3, AlertTriangle, Package, Activity, Inbox, ChevronDown, Beaker } from 'lucide-react';
import { useMockData } from '../../context/MockDataContext';
import { useToast } from '../../context/ToastContext';
import WarehouseFormModal from '../../components/UI/WarehouseFormModal';
import ApotekerFormModal from '../../components/UI/ApotekerFormModal';
import TableSkeleton from '../../components/UI/TableSkeleton';
import EmptyState from '../../components/UI/EmptyState';
import { createPortal } from 'react-dom';
import ConfirmModal from '../../components/UI/ConfirmModal';


const SuperAdminInventoryPage = () => {
    const {
        products, addProduct, updateProduct, deleteProduct,
        treatments, addTreatment, updateTreatment, deleteTreatment,
        racikans, addRacikan, updateRacikan, deleteRacikan,
        materials, addMaterial, updateMaterial, deleteMaterial,
        medicals, addMedical, updateMedical, deleteMedical,
        infusions, addInfusion, updateInfusion, deleteInfusion,
        apotekItems, addApotekItem, updateApotekItem, deleteApotekItem
    } = useMockData();
    const { showToast } = useToast();

    // Filter state: 'all', 'product', 'treatment', 'racikan', 'material', 'medical', 'infusion', 'apotekItem'
    const [activeFilter, setActiveFilter] = useState('all');

    // UI states
    const [searchTerm, setSearchTerm] = useState('');
    const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
    const [isApotekModalOpen, setIsApotekModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [modalType, setModalType] = useState('product'); 
    const [confirmConfig, setConfirmConfig] = useState(null);

    const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    // Combine data (excluding treatments and racikans as requested)
    const allItems = [
        ...products.map(p => ({ ...p, _type: 'product' })),
        ...materials.map(m => ({ ...m, _type: 'material' })),
        ...medicals.map(m => ({ ...m, _type: 'medical' })),
        ...infusions.map(i => ({ ...i, _type: 'infusion' })),
        ...apotekItems.map(a => ({ ...a, _type: 'apotekItem' }))
    ];

    // Apply filters
    const currentData = activeFilter === 'all' ? allItems : allItems.filter(item => item._type === activeFilter);
    const filteredData = currentData.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeFilter]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const toggleFilter = (type) => {
        if (activeFilter === type) {
            setActiveFilter('all');
        } else {
            setActiveFilter(type);
        }
    };

    const handleSave = (data) => {
        const isEdit = !!editingItem;
        
        setConfirmConfig({
            icon: 'save',
            header: isEdit ? 'Konfirmasi Simpan' : 'Konfirmasi Tambah',
            message: isEdit ? 
                `Simpan perubahan untuk ${data.name}?` : 
                `Tambahkan ${data.name} ke daftar stok?`,
            acceptLabel: isEdit ? 'Ya, Simpan' : 'Ya, Tambahkan',
            onAccept: () => {
                if (modalType === 'product') {
                    if (editingItem) updateProduct(data);
                    else addProduct(data);
                } else if (modalType === 'treatment') {
                    if (editingItem) updateTreatment(data);
                    else addTreatment(data);
                } else if (modalType === 'racikan') {
                    if (editingItem) updateRacikan(data);
                    else addRacikan(data);
                } else if (modalType === 'material') {
                    if (editingItem) updateMaterial(data);
                    else addMaterial(data);
                } else if (modalType === 'medical') {
                    if (editingItem) updateMedical(data);
                    else addMedical(data);
                } else if (modalType === 'infusion') {
                    if (editingItem) updateInfusion(data);
                    else addInfusion(data);
                } else if (modalType === 'apotekItem') {
                    if (editingItem) updateApotekItem(data);
                    else addApotekItem(data);
                }
                
                showToast('Data berhasil disimpan', 'success');
                setIsWarehouseModalOpen(false);
                setIsApotekModalOpen(false);
                setEditingItem(null);
            }
        });
    };

    const handleDelete = (item) => {
        setConfirmConfig({
            icon: 'delete',
            header: 'Hapus Item?',
            message: `Yakin ingin menghapus ${item.name}?`,
            acceptLabel: 'Ya, Hapus',
            onAccept: () => {
                if (item._type === 'product') deleteProduct(item.id);
                else if (item._type === 'treatment') deleteTreatment(item.id);
                else if (item._type === 'racikan') deleteRacikan(item.id);
                else if (item._type === 'material') deleteMaterial(item.id);
                else if (item._type === 'medical') deleteMedical(item.id);
                else if (item._type === 'infusion') deleteInfusion(item.id);
                else if (item._type === 'apotekItem') deleteApotekItem(item.id);
                
                showToast('Data berhasil dihapus', 'success');
            }
        });
    };


    const openAddModal = (type) => {
        setModalType(type);
        setEditingItem(null);
        if (['product', 'treatment', 'racikan'].includes(type)) {
            setIsWarehouseModalOpen(true);
        } else {
            // material, medical, infusion, apotekItem
            setIsApotekModalOpen(true);
        }
    };

    const openEditModal = (item) => {
        setModalType(item._type);
        setEditingItem(item);
        if (['product', 'treatment', 'racikan'].includes(item._type)) {
            setIsWarehouseModalOpen(true);
        } else {
            setIsApotekModalOpen(true);
        }
    };

    const openDeleteConfirm = (item) => {
        handleDelete(item);
    };


    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12 px-4 md:px-0">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div className="w-full lg:w-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Stok Klinik</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm tracking-tight">Kelola seluruh stok Apotek dan Gudang</p>
                </div>

                <div className="w-full lg:w-auto relative">
                    <button
                        onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
                        className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-secondary px-10 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Item</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isAddDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isAddDropdownOpen && (
                        <div className="absolute top-full right-0 mt-3 w-full sm:w-80 bg-white rounded-3xl shadow-2xl border border-primary/5 py-3 z-[80] animate-fade-in-up origin-top-right overflow-hidden flex flex-row">
                            <div className="flex-1 border-r border-gray-100">
                                <div className="px-6 py-2">
                                    <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Gudang</p>
                                </div>
                                <button onClick={() => { openAddModal('product'); setIsAddDropdownOpen(false); }} className="w-full flex items-center gap-3 px-6 py-3 hover:bg-primary/[0.04] transition-colors text-left group">
                                    <Package className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs font-black text-primary uppercase tracking-widest">Produk</span>
                                </button>
                            </div>
                            <div className="flex-1">
                                <div className="px-6 py-2">
                                    <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Apotek</p>
                                </div>
                                <button onClick={() => { openAddModal('material'); setIsAddDropdownOpen(false); }} className="w-full flex items-center gap-3 px-6 py-3 hover:bg-primary/[0.04] transition-colors text-left group">
                                    <Beaker className="w-4 h-4 text-orange-500" />
                                    <span className="text-xs font-black text-primary uppercase tracking-widest">Bahan Treatment</span>
                                </button>
                                <button onClick={() => { openAddModal('medical'); setIsAddDropdownOpen(false); }} className="w-full flex items-center gap-3 px-6 py-3 hover:bg-primary/[0.04] transition-colors text-left group">
                                    <Beaker className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs font-black text-primary uppercase tracking-widest">Medis</span>
                                </button>
                                <button onClick={() => { openAddModal('infusion'); setIsAddDropdownOpen(false); }} className="w-full flex items-center gap-3 px-6 py-3 hover:bg-primary/[0.04] transition-colors text-left group">
                                    <Beaker className="w-4 h-4 text-purple-500" />
                                    <span className="text-xs font-black text-primary uppercase tracking-widest">Infus</span>
                                </button>
                                <button onClick={() => { openAddModal('apotekItem'); setIsAddDropdownOpen(false); }} className="w-full flex items-center gap-3 px-6 py-3 hover:bg-primary/[0.04] transition-colors text-left group">
                                    <Package className="w-4 h-4 text-green-500" />
                                    <span className="text-xs font-black text-primary uppercase tracking-widest">Apotek</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {isAddDropdownOpen && (
                        <div
                            className="fixed inset-0 z-[75]"
                            onClick={() => setIsAddDropdownOpen(false)}
                        />
                    )}
                </div>
            </div>

            {/* Controls (Filters & Search) */}
            <div className="bg-white rounded-[2rem] border border-primary/5 shadow-2xl shadow-primary/5 p-4 md:p-6 flex flex-col items-stretch gap-6">
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => setActiveFilter('all')} className={`flex items-center justify-center px-4 py-2 rounded-full border transition-all duration-300 ${activeFilter === 'all' ? 'bg-primary border-primary text-secondary shadow-lg shadow-primary/20 scale-105' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest">Semua</span>
                    </button>
                    <button onClick={() => toggleFilter('product')} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${activeFilter === 'product' ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105' : 'bg-blue-50/50 border-blue-100 text-blue-600 hover:bg-blue-50'}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest">Produk</span>
                    </button>
                    <button onClick={() => toggleFilter('material')} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${activeFilter === 'material' ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20 scale-105' : 'bg-orange-50/50 border-orange-100 text-orange-600 hover:bg-orange-50'}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest">Bhn Treatment</span>
                    </button>
                    <button onClick={() => toggleFilter('medical')} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${activeFilter === 'medical' ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105' : 'bg-blue-50/50 border-blue-100 text-blue-600 hover:bg-blue-50'}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest">Bhn Medis</span>
                    </button>
                    <button onClick={() => toggleFilter('infusion')} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${activeFilter === 'infusion' ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/20 scale-105' : 'bg-purple-50/50 border-purple-100 text-purple-600 hover:bg-purple-50'}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest">Bhn Infus</span>
                    </button>
                    <button onClick={() => toggleFilter('apotekItem')} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${activeFilter === 'apotekItem' ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20 scale-105' : 'bg-green-50/50 border-green-100 text-green-600 hover:bg-green-50'}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest">Brg Apotek</span>
                    </button>
                </div>

                {/* Search */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Cari item berdasarkan nama atau ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-gray-50 border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                </div>
            </div>

            {/* Data Table / List */}
            <div className="bg-white rounded-[2rem] md:rounded-[1rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                {isLoading ? (
                    <TableSkeleton rows={8} columns={6} />
                ) : (
                    <>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5 bg-gray-50/30">
                                        <th className="px-4 py-3 text-primary/80">Kode</th>
                                        <th className="px-4 py-3 text-primary/80">Tipe</th>
                                        <th className="px-4 py-3 text-primary/80">Nama</th>
                                        <th className="px-4 py-3 text-primary/80">Kategori / Harga</th>
                                        <th className="px-4 py-3 text-primary/80">Stok</th>
                                        <th className="px-4 py-3 text-right text-primary/80">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5">
                                    {currentItems.map((item) => (
                                        <tr key={`${item._type}-${item.id}`} className="group hover:bg-primary/[0.02] transition-colors">
                                            <td className="px-4 py-2 font-medium text-xs text-primary/80">{item.id}</td>
                                            <td className="px-4 py-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary/40 bg-primary/5 px-2 py-1 rounded-md">
                                                    {item._type === 'product' ? 'produk' : 
                                                     item._type === 'material' ? 'bhn treatment' :
                                                     item._type === 'medical' ? 'bhn medis' :
                                                     item._type === 'infusion' ? 'bhn infus' :
                                                     item._type === 'apotekItem' ? 'brg apotek' : item._type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-sm font-medium text-primary tracking-tight">{item.name}</td>
                                            <td className="px-4 py-2 text-sm font-medium text-primary/80">
                                                {item.category || (item.price ? `Rp ${item.price.toLocaleString('id-ID')}` : '-')}
                                            </td>
                                            <td className="px-4 py-2">
                                                {item._type === 'treatment' ? (
                                                    <span className="font-medium text-xl text-primary/20">-</span>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-medium text-sm ${item.stock <= (item.minStock || 5) ? 'text-red-500' : 'text-primary'}`}>{item.stock}</span>
                                                        {item.stock <= (item.minStock || 5) && (
                                                            <span className="flex items-center gap-1 text-[10px] font-medium text-red-500 bg-red-50 px-2 py-1 rounded-md uppercase tracking-widest">
                                                                <AlertTriangle className="w-3 h-3" /> Low
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openEditModal(item)} className="p-2.5 rounded-xl bg-white border border-primary/10 text-primary/50 hover:text-primary hover:border-primary/20 hover:shadow-md transition-all active:scale-95" title="Edit"><Edit3 className="w-4 h-4" /></button>
                                                    <button onClick={() => openDeleteConfirm(item)} className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-400 hover:text-red-500 hover:bg-red-100 hover:shadow-md transition-all active:scale-95" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredData.length === 0 && (
                                        <tr>
                                            <td colSpan={6}>
                                                <EmptyState 
                                                    type="data"
                                                    title={`Data Tidak Ditemukan`}
                                                    description={`Sistem tidak menemukan data yang sesuai dengan kriteria pencarian Anda.`}
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                <div className="p-6 md:p-8 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40 bg-primary/5">
                    <span>Menampilkan {filteredData.length === 0 ? 0 : indexOfFirstItem + 1} hingga {Math.min(indexOfLastItem, filteredData.length)} dari {filteredData.length} data</span>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-primary/10 bg-white hover:bg-gray-50 text-primary transition-all duration-300 disabled:opacity-30 active:scale-95 shadow-sm"
                        >
                            Sebelumnya
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-primary text-secondary hover:bg-primary/90 transition-all duration-300 disabled:opacity-30 active:scale-95 shadow-sm"
                        >Selanjutnya</button>
                    </div>
                </div>
            </div>

            <WarehouseFormModal
                isOpen={isWarehouseModalOpen}
                onClose={() => setIsWarehouseModalOpen(false)}
                onSave={handleSave}
                initialData={editingItem}
                type={modalType}
            />

            <ApotekerFormModal
                isOpen={isApotekModalOpen}
                onClose={() => setIsApotekModalOpen(false)}
                onSave={handleSave}
                initialData={editingItem}
                type={modalType}
            />

            <ConfirmModal
                config={confirmConfig}
                onClose={() => setConfirmConfig(null)}
            />

        </div>
    );
};

export default SuperAdminInventoryPage;
