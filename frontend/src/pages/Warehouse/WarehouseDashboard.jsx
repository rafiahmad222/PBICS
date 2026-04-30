import React from 'react';
import { Package, ClipboardList, AlertTriangle, Activity, ChevronRight } from 'lucide-react';
import StatsCard from '../Dashboard/StatsCard';
import { useMockData } from '../../context/MockDataContext';
import { useAuth } from '../../context/AuthContext';
import TableSkeleton from '../../components/UI/TableSkeleton';

const WarehouseDashboard = () => {
    const { products, treatments } = useMockData();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = React.useState(true);

    // Simulate loading
    React.useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const lowStockProducts = products.filter(p => p.stock < 15);
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Dashboard Stok & Gudang</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse"></span>
                        Welcome back, <span className="text-primary/70">{user?.name}</span>
                    </p>
                </div>
            </div>

            {/* Stats Cards - Now 2 columns on small mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                <StatsCard title="Total Item Stok" value={products.length} change="5.2%" trend="up" icon={Package} />
                <StatsCard title="Total Treatment" value={treatments.length} change="2.1%" trend="up" icon={Activity} />
                <StatsCard title="Total Stok" value={totalStock.toLocaleString('id-ID')} change="8.4%" trend="up" icon={ClipboardList} />
                <StatsCard title="Stok Menipis" value={lowStockProducts.length} change={lowStockProducts.length > 0 ? "Check now" : "All safe"} trend={lowStockProducts.length > 0 ? "down" : "up"} icon={AlertTriangle} />
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-primary tracking-tight italic">Peringatan Stok Rendah</h3>
                    <span className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full">Urgent</span>
                </div>
                
                {isLoading ? (
                    <TableSkeleton rows={3} columns={4} />
                ) : (
                    <>
                        {/* Desktop View Table */}
                        <div className="hidden md:block overflow-x-auto scrollbar-hide">
                    {lowStockProducts.length > 0 ? (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-primary/5">
                                    <th className="pb-4 text-[10px] uppercase tracking-widest font-black text-primary/30">Item Stok</th>
                                    <th className="pb-4 text-[10px] uppercase tracking-widest font-black text-primary/30">Kategori</th>
                                    <th className="pb-4 text-[10px] uppercase tracking-widest font-black text-primary/30">Stok Sisa</th>
                                    <th className="pb-4 text-[10px] uppercase tracking-widest font-black text-primary/30 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {lowStockProducts.map(p => (
                                    <tr key={p.id} className="group hover:bg-primary/5 transition-colors">
                                        <td className="py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-secondary/50 overflow-hidden border border-primary/5">
                                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="font-bold text-sm text-primary">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 text-xs text-primary/60 font-medium uppercase tracking-tighter">{p.category}</td>
                                        <td className="py-5 font-black text-sm text-red-500">{p.stock}</td>
                                        <td className="py-5 text-right">
                                            <button className="text-[10px] font-black text-primary/30 hover:text-primary uppercase tracking-widest transition-all">Restock</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-12 text-center text-primary/20 text-sm font-bold uppercase tracking-widest">Semua stok terpantau aman</div>
                    )}
                </div>

                {/* Mobile View Cards */}
                <div className="md:hidden space-y-4">
                    {lowStockProducts.length > 0 ? (
                        lowStockProducts.map(p => (
                            <div key={p.id} className="p-4 rounded-2xl bg-gray-50 border border-primary/5 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-white overflow-hidden border border-primary/5 shrink-0">
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black text-primary truncate">{p.name}</h4>
                                    <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">{p.category}</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="text-xs font-black text-red-500">Stok: {p.stock}</span>
                                    </div>
                                </div>
                                <button className="p-2 rounded-lg bg-white text-primary/40"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center text-primary/20 text-[10px] font-black uppercase tracking-widest">Stok Aman</div>
                    )}
                </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default WarehouseDashboard;