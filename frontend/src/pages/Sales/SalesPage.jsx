import React, { useState, useEffect } from 'react';
import { ShoppingCart, TrendingUp, Users, Package, Search, Filter, ArrowUpRight, ArrowDownRight, MoreHorizontal, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TransactionDetailModal from '../../components/UI/TransactionDetailModal';
import TableSkeleton from '../../components/UI/TableSkeleton';
import StatsCard from '../Dashboard/StatsCard';

const SalesPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const handleOpenDetail = (transaction) => {
        setSelectedTransaction(transaction);
        setIsDetailModalOpen(true);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'selesai':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'menunggu':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'cancelled':
            case 'dibatalkan':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'selesai':
                return <CheckCircle2 className="w-3 h-3" />;
            case 'menunggu':
                return <Clock className="w-3 h-3" />;
            case 'cancelled':
            case 'dibatalkan':
                return <XCircle className="w-3 h-3" />;
            default:
                return null;
        }
    };

    const [recentSales, setRecentSales] = useState([
        { id: 'INV-1001', customer: 'Siti Aminah', product: 'Acne Treatment Pack', amount: 'Rp 450.000', status: 'Selesai', date: '2024-02-08' },
        { id: 'INV-1002', customer: 'Budi Santoso', product: 'Laser Therapy Session', amount: 'Rp 1.200.000', status: 'Menunggu', date: '2024-02-08' },
        { id: 'INV-1003', customer: 'Dewi Lestari', product: 'Chemical Peel', amount: 'Rp 350.000', status: 'Selesai', date: '2024-02-07' },
        { id: 'INV-1004', customer: 'Ahmad Fauzi', product: 'Skin Glow Kit', amount: 'Rp 850.000', status: 'Selesai', date: '2024-02-07' },
        { id: 'INV-1005', customer: 'Rina Wijaya', product: 'Microdermabrasion', amount: 'Rp 600.000', status: 'Cancelled', date: '2024-02-06' },
        { id: 'INV-1006', customer: 'Dian Permata', product: 'Sunscreen Gel SPF 50', amount: 'Rp 150.000', status: 'Selesai', date: '2024-02-06' },
        { id: 'INV-1007', customer: 'Kiki Amalia', product: 'Night Cream Retinol', amount: 'Rp 250.000', status: 'Selesai', date: '2024-02-05' },
        { id: 'INV-1008', customer: 'Farhan Rizki', product: 'Acne Extraction', amount: 'Rp 250.000', status: 'Menunggu', date: '2024-02-05' },
        { id: 'INV-1009', customer: 'Gita Savitri', product: 'Botox Injection', amount: 'Rp 2.500.000', status: 'Selesai', date: '2024-02-04' },
        { id: 'INV-1010', customer: 'Hasan Basri', product: 'Vitamin C Serum', amount: 'Rp 320.000', status: 'Selesai', date: '2024-02-04' },
        { id: 'INV-1011', customer: 'Indah Kusuma', product: 'Facial Whitening', amount: 'Rp 400.000', status: 'Selesai', date: '2024-02-03' },
        { id: 'INV-1012', customer: 'Joko Anwar', product: 'Moisturizer Ceramide', amount: 'Rp 180.000', status: 'Cancelled', date: '2024-02-03' },
        { id: 'INV-1013', customer: 'Kartika Putri', product: 'Skin Rejuvenation Therapy', amount: 'Rp 800.000', status: 'Selesai', date: '2024-02-02' },
        { id: 'INV-1014', customer: 'Lestari Ayu', product: 'Antibacterial Soap', amount: 'Rp 35.000', status: 'Selesai', date: '2024-02-02' },
        { id: 'INV-1015', customer: 'Mirza Ghulam', product: 'Toner BHA/AHA', amount: 'Rp 195.000', status: 'Menunggu', date: '2024-02-01' },
    ]);

    const salesStats = [
        { title: 'Total Sales', value: 'Rp 145.280.000', change: '+12.5%', trend: 'up', icon: ShoppingCart },
        { title: 'Transactions', value: '1,240', change: '+8.2%', trend: 'up', icon: TrendingUp },
        { title: 'Customers', value: '850', change: '+5.4%', trend: 'up', icon: Users },
        { title: 'Stok Terjual', value: '3,120', change: '-2.1%', trend: 'down', icon: Package },
    ];

    const filteredSales = recentSales.filter(sale => sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) || sale.id.toLowerCase().includes(searchTerm.toLowerCase()));

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSales = filteredSales.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    return (
        <div className="space-y-8 md:space-y-12 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Transaksi</h2>
                    <p className="text-primary/40 mt-3 md:mt-4 font-bold text-sm tracking-tight">Monitor dan kelola seluruh transaksi penjualan klinik</p>
                </div>
                <button
                    onClick={() => navigate('/sales/pos')}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-secondary px-8 py-4 md:py-5 rounded-2xl md:rounded-[2rem] hover:scale-105 active:scale-95 transition-all duration-500 font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20"
                >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Transaksi Baru</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {salesStats.map((stat, index) => (
                    <StatsCard 
                        key={index} 
                        title={stat.title} 
                        value={stat.value} 
                        icon={stat.icon} 
                        trend={stat.trend} 
                        change={stat.change} 
                    />
                ))}
            </div>

            {/* Recent Sales Table */}
            <div className="bg-white rounded-[2rem] md:rounded-[1rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-primary/5 flex flex-col lg:flex-row items-stretch lg:items-center gap-6 bg-secondary/10">
                    <h3 className="text-xl md:text-2xl font-black text-primary tracking-tighter">Riwayat Penjualan</h3>
                    <div className="flex flex-col sm:flex-row flex-1 gap-4 items-stretch sm:items-center">
                        <div className="relative group flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Cari invoice atau konsumen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium text-primary/60 shadow-sm"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex-1 sm:flex-none p-4 rounded-2xl bg-white border border-primary/5 text-primary/30 hover:text-primary hover:bg-primary/5 transition-all duration-300 shadow-sm">
                                <Filter className="w-5 h-5 mx-auto" />
                            </button>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <TableSkeleton rows={10} columns={7} />
                ) : (
                    <>
                        <div className="hidden md:block overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left min-w-[1000px]">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5">
                                <th className="px-4 py-3 text-primary/80">ID Invoice</th>
                                <th className="px-4 py-3 text-primary/80">Konsumen</th>
                                <th className="px-4 py-3 text-primary/80">Stok/Layanan</th>
                                <th className="px-4 py-3 text-primary/80">Total</th>
                                <th className="px-4 py-3 text-center text-primary/80">Status</th>
                                <th className="px-4 py-3 text-primary/80">Tanggal</th>
                                <th className="px-4 py-3 text-center text-primary/80">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {currentSales.map((sale) => (
                                <tr 
                                    key={sale.id} 
                                    onClick={() => handleOpenDetail(sale)}
                                    className="border-b border-primary/5 last:border-0 hover:bg-secondary/20 cursor-pointer transition-colors group"
                                >
                                    <td className="px-4 py-2">
                                        <span className="text-sm font-medium text-primary tracking-tight">{sale.id}</span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-primary/5 border border-primary/5 flex items-center justify-center text-[10px] font-bold text-primary shadow-sm">
                                                {sale.customer.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-sm font-medium text-primary">{sale.customer}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className="text-sm font-medium text-primary/80">{sale.product}</span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className="text-sm font-medium text-primary">{sale.amount}</span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${getStatusColor(sale.status)}`}>
                                            {getStatusIcon(sale.status)}
                                            {sale.status}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className="text-sm font-medium text-primary/80">{sale.date}</span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenDetail(sale);
                                            }}
                                            className="p-2 rounded-xl text-primary/20 hover:text-primary hover:bg-white transition-all duration-300 active:scale-90"
                                        >
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-primary/5">
                    {currentSales.map((sale) => (
                        <div key={sale.id} className="p-6 border-b border-primary/5 last:border-0 flex flex-col gap-5">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-[10px] font-black text-primary border border-primary/5">
                                        {sale.customer.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-primary tracking-tight">{sale.customer}</p>
                                        <p className="text-[9px] font-bold text-primary/30 uppercase tracking-widest">{sale.id}</p>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(sale.status)}`}>
                                    {getStatusIcon(sale.status)}
                                    {sale.status}
                                </span>
                            </div>

                            <div className="space-y-3 bg-secondary/30 p-4 rounded-2xl border border-primary/5">
                                <div className="flex justify-between items-center">
                                    <p className="text-[9px] font-black text-primary/30 uppercase tracking-widest">Layanan/Stok</p>
                                    <p className="text-[10px] font-bold text-primary">{sale.product}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-[9px] font-black text-primary/30 uppercase tracking-widest">Total Bayar</p>
                                    <p className="text-sm font-black text-primary">{sale.amount}</p>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-primary/5">
                                    <p className="text-[9px] font-black text-primary/30 uppercase tracking-widest">Tanggal</p>
                                    <p className="text-[10px] font-bold text-primary/60">{sale.date}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => handleOpenDetail(sale)}
                                    className="flex-1 py-3 text-[9px] font-black text-primary/40 uppercase tracking-widest border border-primary/5 rounded-xl hover:bg-white transition-all"
                                >
                                    Detail Invoice
                                </button>
                                <button 
                                    onClick={() => handleOpenDetail(sale)}
                                    className="p-3 text-primary/40 hover:text-primary transition-all rounded-xl border border-primary/5 hover:bg-white"
                                >
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )}

                <div className="p-8 bg-secondary/5 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40">
                    <span>Menampilkan {filteredSales.length === 0 ? 0 : indexOfFirstItem + 1} hingga {Math.min(indexOfLastItem, filteredSales.length)} dari {filteredSales.length} data</span>
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

            <TransactionDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                transaction={selectedTransaction}
            />
        </div>
    );
};

export default SalesPage;
