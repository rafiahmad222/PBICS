import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LabelList, LineChart, Line } from 'recharts';
import { DollarSign, Users, Activity, BarChart3, Calendar, Download, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';
import TableSkeleton from '../../components/UI/TableSkeleton';
import EmptyState from '../../components/UI/EmptyState';
import StatsCard from '../Dashboard/StatsCard';

const data = [
    { name: 'Jan', revenue: 4000, forecast: 4000, customers: 240 },
    { name: 'Feb', revenue: 3000, forecast: 3000, customers: 198 },
    { name: 'Mar', revenue: 2000, forecast: 2000, customers: 980 },
    { name: 'Apr', revenue: 2780, forecast: 2780, customers: 390 },
    { name: 'Mei', revenue: 1890, forecast: 1890, customers: 480 },
    { name: 'Jun', revenue: 2390, forecast: 2390, customers: 380 },
    { name: 'Jul', revenue: 3490, forecast: 3490, customers: 430 },
    { name: 'Agu', forecast: 3800 },
    { name: 'Sep', forecast: 4200 },
];

const treatmentData = [
    { name: 'Facial Acne', value: 400, color: '#1B4D3E' },
    { name: 'Laser Therapy', value: 300, color: '#D4AF37' },
    { name: 'Botox', value: 300, color: '#2C5F4D' },
    { name: 'Chemical Peel', value: 200, color: '#E5D5B0' },
    { name: 'Skin Booster', value: 150, color: '#4A7C59' },
];

const productData = [
    { name: 'Serum Vit C', value: 500, color: '#1B4D3E' },
    { name: 'Sunscreen SPF50', value: 450, color: '#D4AF37' },
    { name: 'Krim Malam', value: 350, color: '#2C5F4D' },
    { name: 'Sabun Wajah', value: 250, color: '#E5D5B0' },
    { name: 'Toner BHA/AHA', value: 200, color: '#829356' },
];

const mockTransactions = [
    { id: 'INV-20260301', date: '2026-03-28', patient: 'Ayu Lestari', treatment: 'Facial Acne', amount: 450000, status: 'Lunas' },
    { id: 'INV-20260302', date: '2026-03-28', patient: 'Budi Santoso', treatment: 'Konsultasi Dokter', amount: 150000, status: 'Lunas' },
    { id: 'INV-20260303', date: '2026-03-27', patient: 'Citra Kirana', treatment: 'Laser Rejuvenation', amount: 1200000, status: 'Lunas' },
    { id: 'INV-20260304', date: '2026-03-27', patient: 'Dewi Persik', treatment: 'Botox', amount: 2500000, status: 'Lunas' },
    { id: 'INV-20260305', date: '2026-03-26', patient: 'Eka Saputra', treatment: 'Peeling', amount: 350000, status: 'Menunggu' },
    { id: 'INV-20260306', date: '2026-03-26', patient: 'Faisal Basri', treatment: 'Pembelian Skincare', amount: 850000, status: 'Lunas' },
];

const ReportsPage = () => {
    const reportCards = [
        { title: 'Pertumbuhan Pendapatan', value: 'Rp 45.2M', change: '+15.4%', trend: 'up', icon: DollarSign },
        { title: 'Pasien Baru', value: '124', change: '+8.2%', trend: 'up', icon: Users },
        { title: 'Total Kunjungan', value: '312', change: '+11.3%', trend: 'up', icon: Activity },
        { title: 'Rata-rata Transaksi', value: 'Rp 850k', change: '-2.1%', trend: 'down', icon: BarChart3 },
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const filteredTransactions = mockTransactions.filter(t => {
        const matchesSearch = t.patient.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              t.treatment.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              t.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesDate = true;
        if (startDate && endDate) {
            matchesDate = t.date >= startDate && t.date <= endDate;
        } else if (startDate) {
            matchesDate = t.date >= startDate;
        } else if (endDate) {
            matchesDate = t.date <= endDate;
        }

        return matchesSearch && matchesDate;
    });

    const handleExportExcel = () => {
        let csvContent = "sep=,\n";
        csvContent += "Invoice,Tanggal,Nama Pasien,Layanan/Stok,Total Biaya (Rp),Status\n";
        filteredTransactions.forEach(t => {
            csvContent += `"${t.id}",${t.date},"${t.patient}","${t.treatment}",${t.amount},"${t.status}"\n`;
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Laporan_Transaksi_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Assuming there isn't a Toast context wrapper in this exact file imported yet, we can construct a basic response. Actually, I will just trigger the download silently if showToast is omitted, or we could add the import. Wait, I didn't import useToast. I will just rely on the download visually.
    };

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Laporan</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm">Analisis performa dan statistik operasional klinik</p>
                </div>
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2 relative z-50 bg-white border border-primary/5 rounded-2xl px-4 lg:px-6 py-3 md:py-4 shadow-lg shadow-primary/5 focus-within:ring-4 focus-within:ring-primary/5 transition-all w-full sm:w-auto">
                        <Calendar className="w-4 h-4 text-primary/40 shrink-0" />
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent border-none outline-none text-primary font-bold text-[10px] md:text-xs w-full min-w-[90px]" />
                        <span className="text-primary/30 text-xs font-bold shrink-0">-</span>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent border-none outline-none text-primary font-bold text-[10px] md:text-xs w-full min-w-[90px]" />
                    </div>
                    <button onClick={handleExportExcel} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
                        <Download className="w-4 h-4 shrink-0" />
                        <span>Export Excel</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {reportCards.map((card, index) => (
                    <StatsCard 
                        key={index} 
                        title={card.title} 
                        value={card.value} 
                        change={card.change} 
                        trend={card.trend} 
                        icon={card.icon} 
                    />
                ))}
            </div>

            {/* Charts Section */}
            <div className="flex flex-col gap-10">
                {/* 1. Full Width Revenue Chart */}
                <div className="w-full bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                        <div>
                            <h3 className="text-xl font-black text-primary tracking-tighter">Performa Pendapatan</h3>
                            <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest mt-1">Estimasi pendapatan bulanan (jutaan)</p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Pendapatan</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent-gold" />
                                <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Pasien</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[250px] md:h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1B4D3E" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#1B4D3E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5D5B0" opacity={0.2} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 900, fill: '#1B4D3E', opacity: 0.3 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => `Rp ${val / 1000}M`}
                                    tick={{ fontSize: 9, fontWeight: 900, fill: '#1B4D3E', opacity: 0.3 }}
                                />
                                <Tooltip
                                    formatter={(val) => [`Rp ${val.toLocaleString('id-ID')} jt`, 'Pendapatan']}
                                    contentStyle={{
                                        borderRadius: '1.5rem',
                                        border: 'none',
                                        boxShadow: '0 25px 50px -12px rgba(27, 77, 62, 0.15)',
                                        fontFamily: 'Inter, sans-serif'
                                    }}
                                />
                                <Area type="monotone" dataKey="forecast" stroke="#1B4D3E" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                                <Area type="monotone" dataKey="revenue" stroke="#1B4D3E" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Two Columns: Treatment & Product */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 flex flex-col">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h3 className="text-xl font-black text-primary tracking-tighter">Penjualan Treatment</h3>
                                <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest mt-1">Distribusi layanan terpopuler</p>
                            </div>
                            <div className="bg-primary/5 px-4 py-2 rounded-xl">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Total: 1,200</span>
                            </div>
                        </div>
                        <div className="h-[200px] md:h-[250px] w-full mb-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={treatmentData} margin={{ top: 20, bottom: 5, left: 20, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1B4D3E" opacity={0.03} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 9, fontWeight: 900, fill: '#1B4D3E', opacity: 0.5 }}
                                        dy={10}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#1B4D3E', strokeWidth: 1, strokeDasharray: '5 5' }}
                                        contentStyle={{ 
                                            borderRadius: '1.25rem', 
                                            border: 'none', 
                                            boxShadow: '0 25px 50px -12px rgba(27, 77, 62, 0.15)', 
                                            padding: '12px 16px',
                                            background: '#FFFFFF'
                                        }}
                                        itemStyle={{ color: '#1B4D3E', fontWeight: 900, fontSize: '14px' }}
                                        labelStyle={{ color: '#1B4D3E', opacity: 0.4, fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke="#1B4D3E" 
                                        strokeWidth={4} 
                                        dot={{ r: 6, fill: '#1B4D3E', strokeWidth: 2, stroke: '#FFFFFF' }}
                                        activeDot={{ r: 8, strokeWidth: 0 }}
                                    >
                                        <LabelList dataKey="value" position="top" style={{ fontSize: '10px', fontWeight: 900, fill: '#1B4D3E', opacity: 0.8 }} dy={-15} />
                                    </Line>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-6 mt-auto">
                            {treatmentData.map((item, index) => (
                                <div key={index} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                                            {item.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-primary tracking-tight">{item.name}</p>
                                            <p className="text-[9px] font-black text-primary/30 uppercase tracking-widest">{item.value} Penjualan</p>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black text-primary/40 uppercase tracking-widest">
                                        {Math.round((item.value / 1200) * 100)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 flex flex-col">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h3 className="text-xl font-black text-primary tracking-tighter">Penjualan Stok</h3>
                                <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest mt-1">Perputaran item stok terjual</p>
                            </div>
                            <div className="bg-accent-gold/10 px-4 py-2 rounded-xl">
                                <span className="text-[10px] font-black text-accent-gold uppercase tracking-widest leading-none">Total: 1,550</span>
                            </div>
                        </div>
                        <div className="h-[200px] md:h-[250px] w-full mb-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={productData} margin={{ top: 20, bottom: 5, left: 20, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1B4D3E" opacity={0.03} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 9, fontWeight: 900, fill: '#1B4D3E', opacity: 0.5 }}
                                        dy={10}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#D4AF37', strokeWidth: 1, strokeDasharray: '5 5' }}
                                        contentStyle={{ 
                                            borderRadius: '1.25rem', 
                                            border: 'none', 
                                            boxShadow: '0 25px 50px -12px rgba(27, 77, 62, 0.15)', 
                                            padding: '12px 16px',
                                            background: '#FFFFFF'
                                        }}
                                        itemStyle={{ color: '#D4AF37', fontWeight: 900, fontSize: '14px' }}
                                        labelStyle={{ color: '#1B4D3E', opacity: 0.4, fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke="#D4AF37" 
                                        strokeWidth={4} 
                                        dot={{ r: 6, fill: '#D4AF37', strokeWidth: 2, stroke: '#FFFFFF' }}
                                        activeDot={{ r: 8, strokeWidth: 0 }}
                                    >
                                        <LabelList dataKey="value" position="top" style={{ fontSize: '10px', fontWeight: 900, fill: '#1B4D3E', opacity: 0.8 }} dy={-15} />
                                    </Line>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-6 mt-auto">
                            {productData.map((item, index) => (
                                <div key={index} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                                            {item.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-primary tracking-tight">{item.name}</p>
                                            <p className="text-[9px] font-black text-primary/30 uppercase tracking-widest">{item.value} Penjualan</p>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black text-primary/40 uppercase tracking-widest">
                                        {Math.round((item.value / 1550) * 100)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Table Section (Option A Layout) */}
            <div className="bg-white rounded-[2rem] md:rounded-[1rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden mt-10">
                <div className="p-6 md:p-10 border-b border-primary/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h3 className="text-xl font-black text-primary tracking-tighter">Detail Transaksi</h3>
                        <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest mt-1">Rincian pendapatan operasional</p>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                        <input type="text" placeholder="Cari nota, pasien..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-primary/5 border-none outline-none text-primary placeholder:text-primary/30 font-bold text-xs focus:ring-4 focus:ring-primary/10 transition-all" />
                    </div>
                </div>

                {isLoading ? (
                    <TableSkeleton rows={6} columns={6} />
                ) : (
                    <>
                        <div className="hidden md:block overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5 bg-gray-50/30">
                                <th className="px-4 py-3 text-primary/80">Invoice</th>
                                <th className="px-4 py-3 text-primary/80">Tanggal</th>
                                <th className="px-4 py-3 text-primary/80">Pasien</th>
                                <th className="px-4 py-3 text-primary/80">Layanan / Stok</th>
                                <th className="px-4 py-3 text-right text-primary/80">Total (Rp)</th>
                                <th className="px-4 py-3 text-center text-primary/80">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {filteredTransactions.map((trx, idx) => (
                                <tr key={idx} className="border-b border-primary/5 last:border-0 hover:bg-primary/[0.02] transition-colors">
                                    <td className="px-4 py-2">
                                        <span className="text-sm font-medium text-primary tracking-tight">{trx.id}</span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className="text-sm font-medium text-primary/80">{trx.date}</span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className="text-sm font-medium text-primary">{trx.patient}</span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className="text-sm font-medium text-primary/80">{trx.treatment}</span>
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <span className="text-sm font-medium text-primary">{(trx.amount).toLocaleString('id-ID')}</span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border ${trx.status === 'Lunas' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>{trx.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-primary/5">
                    {filteredTransactions.map((trx, idx) => (
                        <div key={trx.id || idx} className="p-6 space-y-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">{trx.id}</span>
                                    <h4 className="text-sm font-black text-primary tracking-tight mt-0.5">{trx.patient}</h4>
                                </div>
                                <span className={`inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${trx.status === 'Lunas' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                    {trx.status}
                                </span>
                            </div>

                            <div className="bg-gray-50/50 p-4 rounded-2xl border border-primary/5 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-primary/30 uppercase tracking-widest">Layanan / Stok</span>
                                    <span className="text-[10px] font-bold text-primary/60">{trx.treatment}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-primary/5">
                                    <span className="text-[9px] font-black text-primary/30 uppercase tracking-widest">Total Biaya</span>
                                    <span className="text-sm font-black text-primary">Rp {(trx.amount).toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-[10px] font-bold text-primary/30 px-1">
                                <span>{trx.date}</span>
                            </div>
                        </div>
                    ))}
                    {filteredTransactions.length === 0 && (
                        <EmptyState 
                            type="sales"
                            title="Transaksi Tidak Ditemukan"
                            description="Sistem tidak menemukan transaksi yang sesuai dengan kriteria filter atau pencarian Anda."
                        />
                    )}
                </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;
