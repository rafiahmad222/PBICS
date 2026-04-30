import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit3, AlertTriangle, Package, Inbox, ChevronDown, Beaker } from 'lucide-react';
import { useMockData } from '../../context/MockDataContext';
import { useToast } from '../../context/ToastContext';
import ApotekerFormModal from '../../components/UI/ApotekerFormModal';
import TableSkeleton from '../../components/UI/TableSkeleton';
import EmptyState from '../../components/UI/EmptyState';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/UI/ConfirmModal';


const ApotekerInventoryPage = () => {
    const { user } = useAuth();
    const isViewOnly = false; // Apoteker is the main actor here

    const {
        materials, addMaterial, updateMaterial,
        medicals, addMedical, updateMedical,
        infusions, addInfusion, updateInfusion,
        apotekItems, addApotekItem, updateApotekItem
    } = useMockData();
    const { showToast } = useToast();

    // Filter state: 'all', 'material', 'medical', 'infusion', 'apotekItem'
    const [activeFilter, setActiveFilter] = useState('all');

    // UI states
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [modalType, setModalType] = useState('material'); // to determine which form to show
    const [confirmConfig, setConfirmConfig] = useState(null);
    const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);


    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    // Combine data
    const allItems = [
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
                if (modalType === 'material') {
                    if (isEdit) {
                        updateMaterial(data);
                    } else {
                        addMaterial(data);
                    }
                } else if (modalType === 'medical') {
                    if (isEdit) {
                        updateMedical(data);
                    } else {
                        addMedical(data);
                    }
                } else if (modalType === 'infusion') {
                    if (isEdit) {
                        updateInfusion(data);
                    } else {
                        addInfusion(data);
                    }
                } else if (modalType === 'apotekItem') {
                    if (isEdit) {
                        updateApotekItem(data);
                    } else {
                        addApotekItem(data);
                    }
                }
                
                showToast(`Data berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}`, 'success');
                setIsModalOpen(false);
                setEditingItem(null);
            }
        });
    };


    const openAddModal = (type) => {
        setModalType(type);
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setModalType(item._type);
        setEditingItem(item);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12 px-4 md:px-0">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div className="w-full lg:w-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Stok Apotek</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm tracking-tight">Kelola stok apotek dan medis klinik</p>
                </div>

                <div className="w-full lg:w-auto relative">
                    <button
                        onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
                        className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-secondary px-10 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Stok</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isAddDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isAddDropdownOpen && (
                        <div className="absolute top-full right-0 mt-3 w-full sm:w-64 bg-white rounded-3xl shadow-2xl border border-primary/5 py-3 z-[80] animate-fade-in-up origin-top-right overflow-hidden">
                            <button
                                onClick={() => { openAddModal('material'); setIsAddDropdownOpen(false); }}
                                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-primary/[0.04] transition-colors text-left group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Beaker className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-primary uppercase tracking-widest">Bahan Treatment</p>
                                </div>
                            </button>
                            <button
                                onClick={() => { openAddModal('medical'); setIsAddDropdownOpen(false); }}
                                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-primary/[0.04] transition-colors text-left group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Beaker className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-primary uppercase tracking-widest">Bahan Medis</p>
                                </div>
                            </button>
                            <button
                                onClick={() => { openAddModal('infusion'); setIsAddDropdownOpen(false); }}
                                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-primary/[0.04] transition-colors text-left group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Beaker className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-primary uppercase tracking-widest">Bahan Infus</p>
                                </div>
                            </button>
                            <button
                                onClick={() => { openAddModal('apotekItem'); setIsAddDropdownOpen(false); }}
                                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-primary/[0.04] transition-colors text-left group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-primary uppercase tracking-widest">Barang Apotek</p>
                                </div>
                            </button>
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
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`flex items-center justify-center px-5 py-2.5 rounded-full border transition-all duration-300 ${activeFilter === 'all' ? 'bg-primary border-primary text-secondary shadow-lg shadow-primary/20 scale-105' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                    >
                        <span className="text-xs font-black uppercase tracking-widest">Semua Item</span>
                    </button>

                    <button
                        onClick={() => toggleFilter('material')}
                        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 ${activeFilter === 'material' ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20 scale-105' : 'bg-orange-50/50 border-orange-100 text-orange-600 hover:bg-orange-50'}`}
                    >
                        <Beaker className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Bahan Treatment</span>
                    </button>
                    <button
                        onClick={() => toggleFilter('medical')}
                        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 ${activeFilter === 'medical' ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105' : 'bg-blue-50/50 border-blue-100 text-blue-600 hover:bg-blue-50'}`}
                    >
                        <Beaker className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Bahan Medis</span>
                    </button>
                    <button
                        onClick={() => toggleFilter('infusion')}
                        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 ${activeFilter === 'infusion' ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/20 scale-105' : 'bg-purple-50/50 border-purple-100 text-purple-600 hover:bg-purple-50'}`}
                    >
                        <Beaker className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Bahan Infus</span>
                    </button>
                    <button
                        onClick={() => toggleFilter('apotekItem')}
                        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 ${activeFilter === 'apotekItem' ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20 scale-105' : 'bg-green-50/50 border-green-100 text-green-600 hover:bg-green-50'}`}
                    >
                        <Package className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Barang Apotek</span>
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
                    <TableSkeleton rows={8} columns={5} />
                ) : (
                    <>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5 bg-gray-50/30">
                                        <th className="px-4 py-3 text-primary/80">Kode</th>
                                        <th className="px-4 py-3 text-primary/80">Nama</th>
                                        <th className="px-4 py-3 text-primary/80">Kategori</th>
                                        <th className="px-4 py-3 text-primary/80">Stok</th>
                                        {!isViewOnly && <th className="px-4 py-3 text-right text-primary/80">Aksi</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5">
                                    {currentItems.map((item) => (
                                        <tr key={`${item._type}-${item.id}`} className="group hover:bg-primary/[0.02] transition-colors">
                                            <td className="px-4 py-2 font-medium text-xs text-primary/80">{item.id}</td>
                                            <td className="px-4 py-2 text-sm font-medium text-primary tracking-tight">{item.name}</td>
                                            <td className="px-4 py-2 text-sm font-medium text-primary/80">{item.category}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-medium text-sm ${item.stock <= (item.minStock || 5) ? 'text-red-500' : 'text-primary'}`}>{item.stock}</span>
                                                    {item.stock <= (item.minStock || 5) && (
                                                        <span className="flex items-center gap-1 text-[10px] font-medium text-red-500 bg-red-50 px-2 py-1 rounded-md uppercase tracking-widest">
                                                            <AlertTriangle className="w-3 h-3" /> Low
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            {!isViewOnly && (
                                                <td className="px-4 py-2 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => openEditModal(item)} className="p-2.5 rounded-xl bg-white border border-primary/10 text-primary/50 hover:text-primary hover:border-primary/20 hover:shadow-md transition-all active:scale-95" title="Edit"><Edit3 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {filteredData.length === 0 && (
                                        <tr>
                                            <td colSpan={5}>
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

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-primary/5">
                            {currentItems.map((item) => (
                                <div key={`${item._type}-${item.id}`} className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-sm font-black text-primary tracking-tight uppercase leading-tight mb-2">{item.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-md">{item.id}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.category}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex bg-white rounded-xl border border-gray-100 divide-x divide-gray-100 overflow-hidden shadow-sm">
                                        <div className="flex-1 p-3">
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Stok</p>
                                            <div className="flex items-center gap-2">
                                                <p className={`text-xs font-black ${item.stock <= (item.minStock || 5) ? 'text-red-500' : 'text-gray-700'}`}>{item.stock} Unit</p>
                                                {item.stock <= (item.minStock || 5) && (
                                                    <AlertTriangle className="w-3 h-3 text-red-500" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {!isViewOnly && (
                                        <div className="flex gap-2 pt-1 border-t border-primary/5 mt-3 pt-3">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-primary active:scale-95 transition-all"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" /> Edit
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {filteredData.length === 0 && (
                                <EmptyState 
                                    type="data"
                                    title={`Data Tidak Ditemukan`}
                                    description={`Sistem tidak menemukan data yang sesuai dengan kriteria pencarian Anda.`}
                                />
                            )}
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

            <ApotekerFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
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


export default ApotekerInventoryPage;
