import React, { useState } from 'react'; 
import { Users, DollarSign, Activity, TrendingUp, PieChart, BarChart3, ArrowUpRight, ArrowDownRight, ShoppingBag, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts'; 
import StatsCard from './StatsCard'; 
import { useAuth } from '../../context/AuthContext'; 

const revenueData = [
    { name: 'Jan', revenue: 450, target: 400 }, 
    { name: 'Feb', revenue: 480, target: 420 },
    { name: 'Mar', revenue: 520, target: 450 },
    { name: 'Apr', revenue: 490, target: 480 },
    { name: 'Mei', revenue: 580, target: 500 },
    { name: 'Jun', revenue: 610, target: 550 },
    { name: 'Jul', revenue: 650, target: 600 },
];

const salesSourceData = [
    { name: 'Klinik (Kantor)', value: 1250, color: '#1B4D3E' }, 
    { name: 'E-Commerce', value: 850, color: '#D4AF37' }, 
    { name: 'Reseller', value: 450, color: '#829356' }, 
];

const treatmentPerfData = [
    { name: 'Facial', total: 120 },
    { name: 'Laser', total: 85 },
    { name: 'Botox', total: 60 },
    { name: 'Peeling', total: 50 },
    { name: 'Skincare', total: 200 },
];

const OwnerDashboard = () => {
    const { user } = useAuth();
    const [activePieIndex, setActivePieIndex] = useState(0);

    const onPieEnter = (_, index) => {
        setActivePieIndex(index);
    };

    const renderActiveShape = (props) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
        return (
            <g>
                <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="#1B4D3E" className="font-black text-xs uppercase tracking-tighter">
                    {payload.name}
                </text>
                <text x={cx} y={cy} dy={15} textAnchor="middle" fill="#1B4D3E" className="font-black text-lg tracking-tighter">
                    Rp {value}jt
                </text>
                <Pie
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 8}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    stroke="none"
                />
            </g>
        );
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12"> 
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Executive Dashboard</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse"></span>
                        Overview Strategis - {user?.role} 
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 md:py-4 bg-white text-primary border border-primary/10 rounded-2xl font-bold text-sm shadow-xl shadow-primary/5 hover:scale-105 active:scale-95 transition-all duration-300">
                        Bulan Ini
                    </button>
                    <button className="px-6 py-3 md:py-4 bg-primary text-secondary rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300">
                        Unduh Laporan Executive
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatsCard
                    title="Total Pendapatan"
                    value="Rp 3.7M"
                    change="15.8%"
                    trend="up"
                    icon={DollarSign}
                />
                <StatsCard
                    title="Profit margin"
                    value="28.4%"
                    change="2.1%"
                    trend="up"
                    icon={Target}
                />
                <StatsCard
                    title="Pertumbuhan Pasien"
                    value="+482"
                    change="5.4%"
                    trend="up"
                    icon={Users}
                />
                <StatsCard
                    title="Biaya Akuisisi Cust"
                    value="Rp 85k"
                    change="12%"
                    trend="down"
                    icon={Activity}
                />
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Revenue vs Target Trend - spanning 2 columns */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-primary/10 shadow-xl shadow-primary/[0.08]">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-primary tracking-tight">Pendapatan vs Target</h3>
                            <span className="text-primary/40 text-[10px] font-black uppercase tracking-widest mt-1 block">Dalam Jutaan Rupiah</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-primary/20"></span>
                                <span className="text-xs font-bold text-primary">Target</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-primary"></span>
                                <span className="text-xs font-bold text-primary">Realisasi</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevTarget" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1B4D3E" stopOpacity={0.05} />
                                        <stop offset="95%" stopColor="#1B4D3E" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRevReal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1B4D3E" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#1B4D3E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5D5B0" opacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#1B4D3E', opacity: 0.5 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#1B4D3E', opacity: 0.5 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#1B4D3E', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="target" stroke="#1B4D3E" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorRevTarget)" />
                                <Area type="monotone" dataKey="revenue" stroke="#1B4D3E" strokeWidth={3} fillOpacity={1} fill="url(#colorRevReal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sales Sources Pie Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-primary/10 shadow-xl shadow-primary/[0.08] flex flex-col">
                    <div>
                        <h3 className="text-xl font-black text-primary tracking-tight">Sumber Penjualan</h3>
                        <span className="text-primary/40 text-[10px] font-black uppercase tracking-widest mt-1 block">Distribusi Saluran (Juta Rp)</span>
                    </div>
                    <div className="h-[250px] w-full mt-4 flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie
                                    activeIndex={activePieIndex}
                                    activeShape={renderActiveShape}
                                    data={salesSourceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={65}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                    onMouseEnter={onPieEnter}
                                >
                                    {salesSourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} opacity={activePieIndex === index ? 1 : 0.6} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(v) => [`Rp ${v}jt`, 'Total']}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: '#1B4D3E', fontWeight: 'bold', fontSize: '12px' }}
                                />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 mt-4">
                        {salesSourceData.map((source, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }}></div>
                                    <span className="text-xs font-bold text-primary">{source.name}</span>
                                </div>
                                <span className="text-sm font-black text-primary">{(source.value / 10).toFixed(1)}k</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Breakdown & Operational Efficiency */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Treatment Performance */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-primary/10 shadow-xl shadow-primary/[0.08]">
                     <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-primary tracking-tight">Perilaku Pelanggan</h3>
                            <span className="text-primary/40 text-[10px] font-black uppercase tracking-widest mt-1 block">Transaksi Tertinggi berdasarkan Kategori</span>
                        </div>
                        <div className="p-3 bg-secondary rounded-2xl">
                            <ShoppingBag className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={treatmentPerfData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5D5B0" opacity={0.3} />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#1B4D3E', opacity: 0.5 }} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#1B4D3E' }} />
                                <Tooltip
                                    cursor={{fill: '#1B4D3E', opacity: 0.05}}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="total" fill="#D4AF37" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                 {/* Operational Highlights */}
                 <div className="bg-white p-8 rounded-[2.5rem] border border-primary/10 shadow-xl shadow-primary/[0.08] flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-black text-primary tracking-tight">Highlight Operasional</h3>
                        <span className="text-primary/40 text-[10px] font-black uppercase tracking-widest mt-1 block">Ringkasan Efisiensi Bisnis</span>
                    </div>

                    <div className="space-y-6 mt-6">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                                    <Target className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-primary">Tingkat Retensi (Retention Rate)</h4>
                                    <p className="text-xs font-medium text-primary/60">Pasien yang kembali dalam 6 bulan</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-xl font-black text-primary">68%</span>
                                <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">+4% dari bulan lalu</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-primary">Rata-rata Nilai Transaksi</h4>
                                    <p className="text-xs font-medium text-primary/60">Perawatan + Stok Skincare</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-xl font-black text-primary">Rp 1.2M</span>
                                <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">+12% dari Q1</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;
