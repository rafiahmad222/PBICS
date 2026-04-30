import React, { useState, useMemo } from 'react';
import { 
    Calendar, 
    Plus, 
    Search,
    Phone,
    User,
    Clock,
    Info,
    CheckCircle2,
    Clock4,
    AlertCircle,
    XCircle,
    Edit3,
    Trash2,
    Star,
    Award
} from 'lucide-react';
import { useMockData } from '../../context/MockDataContext';
import { useToast } from '../../context/ToastContext';
import ReservationFormModal from '../../components/UI/ReservationFormModal';
import ConfirmModal from '../../components/UI/ConfirmModal';
import TableSkeleton from '../../components/UI/TableSkeleton';
import StatsCard from '../Dashboard/StatsCard';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rbac';


const ReservationsPage = () => {
    const { user } = useAuth();
    const { bookings, deleteBooking, slotAvailability, updateSlotAvailability } = useMockData();
    const { showToast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [confirmConfig, setConfirmConfig] = useState(null);

    // Simulate loading
    React.useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const filteredBookings = bookings.filter(booking => 
        (booking.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (booking.phone?.includes(searchTerm)) ||
        (booking.broughtByStaff?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const favoriteTreatment = useMemo(() => {
        if (!bookings.length) return '-';
        const counts = bookings.reduce((acc, b) => {
            if (b.treatment) acc[b.treatment] = (acc[b.treatment] || 0) + 1;
            return acc;
        }, {});
        if (Object.keys(counts).length === 0) return '-';
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }, [bookings]);

    const topStaff = useMemo(() => {
        if (!bookings.length) return '-';
        const counts = bookings.reduce((acc, b) => {
            if (b.broughtByStaff) acc[b.broughtByStaff] = (acc[b.broughtByStaff] || 0) + 1;
            return acc;
        }, {});
        if (Object.keys(counts).length === 0) return '-';
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }, [bookings]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'dikonfirmasi':
            case 'confirmed':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'menunggu':
            case 'waiting':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'dibatalkan':
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'dikonfirmasi':
            case 'confirmed':
                return <CheckCircle2 className="w-3 h-3" />;
            case 'menunggu':
            case 'waiting':
                return <Clock4 className="w-3 h-3" />;
            case 'dibatalkan':
            case 'cancelled':
                return <XCircle className="w-3 h-3" />;
            default:
                return <AlertCircle className="w-3 h-3" />;
        }
    };

    const openEditModal = (booking) => {
        setEditingBooking(booking);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingBooking(null);
        setIsModalOpen(true);
    };

    const handleOpenDelete = (booking) => {
        setConfirmConfig({
            icon: 'delete',
            header: 'Hapus Reservasi?',
            message: `Yakin ingin menghapus reservasi atas nama ${booking.name}?`,
            acceptLabel: 'Ya, Hapus',
            onAccept: () => {
                deleteBooking(booking.id);
                showToast('Reservasi berhasil dihapus', 'success');
            }
        });
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 lg:gap-0">
                <div className="w-full lg:w-auto">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary tracking-tighter leading-[0.9]">
                        Ringkasan <br className="hidden sm:block lg:hidden" /> Reservasi
                    </h2>
                    <p className="text-primary/40 mt-4 font-bold text-sm md:text-base">
                        Kelola antrian dan jadwal kunjungan customer secara real-time
                    </p>
                </div>
                <button 
                    onClick={openAddModal}
                    className="w-full lg:w-auto flex items-center justify-center gap-3 bg-primary text-secondary px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    Tambah Reservasi
                </button>
            </div>


            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                {[
                    { label: 'Total Reservasi', value: bookings.length, icon: Calendar, color: 'primary' },
                    { label: 'Treatment Favorit', value: favoriteTreatment, icon: Star, color: 'primary' },
                    { label: 'Pendaftar Teraktif', value: topStaff, icon: Award, color: 'primary' },
                    { label: 'Jam Padat', value: '14:00 - 16:00', icon: Clock, color: 'primary' },
                ].map((stat, i) => (
                    <StatsCard 
                        key={i} 
                        title={stat.label} 
                        value={stat.value} 
                        icon={stat.icon} 
                        trend="up" 
                    />
                ))}
            </div>


            {/* Slot Management (Only for Assistant SPV Treatment or Admin) */}
            {(user?.role === ROLES.ASISTEN_SUPERVISOR_TREATMENT || user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.OWNER) && (
                <div className="bg-white rounded-[2rem] border border-primary/5 shadow-2xl shadow-primary/5 p-8 animate-fade-in-up">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-primary tracking-tighter">Manajemen Ketersediaan Jam</h4>
                            <p className="text-primary/40 text-[10px] font-bold uppercase tracking-widest mt-1">Atur ketersediaan slot reservasi hari ini</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {slotAvailability.map((slot) => (
                            <button
                                key={slot.time}
                                onClick={() => updateSlotAvailability(slot.time, !slot.available)}
                                className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 group relative overflow-hidden ${
                                    slot.available 
                                    ? 'border-green-100 bg-green-50/30 hover:bg-green-50' 
                                    : 'border-red-100 bg-red-50/30 hover:bg-red-50'
                                }`}
                            >
                                <div className={`absolute top-0 right-0 w-12 h-12 opacity-5 -mr-4 -mt-4 transition-transform group-hover:scale-110 ${slot.available ? 'text-green-500' : 'text-red-500'}`}>
                                    <Clock className="w-full h-full" />
                                </div>
                                <span className="text-xl font-black text-primary tracking-tight">{slot.time}</span>
                                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                    slot.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                }`}>
                                    {slot.available ? 'Tersedia' : 'Penuh / Tutup'}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}


            {/* Table Section */}
            <div className="bg-white rounded-[2rem] md:rounded-[1rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-primary/5 bg-gray-50/30">
                    <div className="relative w-full group">
                        <Search className="w-5 h-5 text-primary/20 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari nama, telp, atau Karyawan..."
                            className="w-full pl-12 pr-4 py-4 bg-white border border-primary/5 rounded-2xl text-primary placeholder:text-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium text-sm shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <TableSkeleton rows={8} columns={7} />
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5 bg-gray-50/30">
                                        <th className="px-6 py-4 text-primary/80">Jam Reservasi</th>
                                        <th className="px-6 py-4 text-primary/80">Nama Customer</th>
                                        <th className="px-6 py-4 text-primary/80">No. Telepon</th>
                                        <th className="px-6 py-4 text-primary/80">Pendaftar</th>
                                        <th className="px-6 py-4 text-primary/80">Keterangan</th>
                                        <th className="px-6 py-4 text-right text-primary/80">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5">
                                    {filteredBookings.length > 0 ? (
                                        filteredBookings.map((booking) => (
                                            <tr key={booking.id} className="group hover:bg-primary/[0.02] transition-colors cursor-default">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3 text-primary/80">
                                                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                                                            <Clock className="w-4 h-4 text-primary/60" />
                                                        </div>
                                                        <span className="text-sm font-bold">{booking.time}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-sm font-bold text-primary tracking-tight">{booking.name}</p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-sm font-medium text-primary/80">
                                                        <Phone className="w-3.5 h-3.5 text-primary/40" />
                                                        {booking.phone}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-primary/80">
                                                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center border border-primary/5">
                                                            <User className="w-3 h-3" />
                                                        </div>
                                                        <span className="text-xs font-bold uppercase tracking-wider">{booking.broughtByStaff}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-start gap-2 max-w-xs text-primary/80">
                                                        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary/30" />
                                                        <p className="text-xs font-medium leading-relaxed line-clamp-2">{booking.notes || 'Tidak ada catatan khusus'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(booking)}
                                                            className="p-2.5 rounded-xl bg-white border border-primary/10 text-primary/50 hover:text-primary hover:border-primary/20 hover:shadow-md transition-all active:scale-95"
                                                            title="Edit Reservasi"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenDelete(booking)}
                                                            className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-400 hover:text-red-500 hover:bg-red-100 hover:shadow-md transition-all active:scale-95"
                                                            title="Hapus Reservasi"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center text-primary/10">
                                                        <Search className="w-10 h-10" />
                                                    </div>
                                                    <div>
                                                        <p className="text-primary font-black uppercase tracking-widest text-xs">Data tidak ditemukan</p>
                                                        <p className="text-primary/30 text-[10px] font-bold uppercase tracking-widest mt-1">Gunakan kata kunci pencarian lainnya</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-primary/5">
                            {filteredBookings.length > 0 ? (
                                filteredBookings.map((booking) => (
                                    <div key={booking.id} className="p-6 space-y-6 hover:bg-gray-50/30 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-inner">
                                                    <Clock className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-black text-primary tracking-tighter">{booking.time}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                        <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Scheduled</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => openEditModal(booking)}
                                                    className="p-3 rounded-2xl bg-white border border-primary/10 text-primary/50 hover:text-primary active:scale-90 transition-all shadow-sm"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenDelete(booking)}
                                                    className="p-3 rounded-2xl bg-red-50 border border-red-100 text-red-500 active:scale-90 transition-all shadow-sm"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-2xl bg-secondary/30 border border-primary/5">
                                                <p className="text-[9px] font-black text-primary/30 uppercase tracking-[0.1em] mb-1">Customer</p>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-3.5 h-3.5 text-primary/40" />
                                                    <p className="text-sm font-black text-primary tracking-tight truncate">{booking.name}</p>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-secondary/30 border border-primary/5">
                                                <p className="text-[9px] font-black text-primary/30 uppercase tracking-[0.1em] mb-1">Contact</p>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-3.5 h-3.5 text-primary/40" />
                                                    <p className="text-sm font-bold text-primary/80">{booking.phone}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between px-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Award className="w-3 h-3 text-primary" />
                                                </div>
                                                <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest truncate">Reg by: {booking.broughtByStaff}</span>
                                            </div>
                                        </div>

                                        {booking.notes && (
                                            <div className="p-4 rounded-[1.5rem] bg-gray-50/80 border border-dashed border-primary/10 relative">
                                                <Info className="w-3.5 h-3.5 text-primary/20 absolute -top-1.5 -right-1.5 bg-white rounded-full" />
                                                <p className="text-xs text-primary/60 font-medium italic leading-relaxed">
                                                    "{booking.notes}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center text-primary/10">
                                            <Search className="w-10 h-10" />
                                        </div>
                                        <div>
                                            <p className="text-primary font-black uppercase tracking-widest text-xs">Data tidak ditemukan</p>
                                            <p className="text-primary/30 text-[10px] font-bold uppercase tracking-widest mt-1">Gunakan kata kunci pencarian lainnya</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )
}
            </div>

            {/* Modal Tambah / Edit */}
            <ReservationFormModal 
                isOpen={isModalOpen} 
                onClose={() => { setIsModalOpen(false); setEditingBooking(null); }}
                initialData={editingBooking}
            />

            {/* Delete Confirm Modal */}
            <ConfirmModal
                config={confirmConfig}
                onClose={() => setConfirmConfig(null)}
            />
        </div>
    );
};

export default ReservationsPage;

