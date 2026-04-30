import React, { useState } from 'react';
import { Users, DollarSign, CalendarCheck, TrendingUp, Plus } from 'lucide-react';
import StatsCard from './StatsCard';
import AnalysisChart from './AnalysisChart';
import { useAuth } from '../../context/AuthContext';
import { useMockData } from '../../context/MockDataContext';

const Dashboard = () => {
    const { user } = useAuth();
    const { bookings } = useMockData();

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Dashboard</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse"></span>
                        Welcome back, <span className="text-primary/70">{user?.name || 'User'}</span>
                    </p>
                </div>
                <button className="w-full sm:w-auto px-6 py-3 md:py-4 bg-primary text-secondary rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300">
                    Generate Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatsCard
                    title="Total Pasien"
                    value="1,284"
                    change="12.5%"
                    trend="up"
                    icon={Users}
                />
                <StatsCard
                    title="Revenue"
                    value="Rp 58.4"
                    change="8.2%"
                    trend="up"
                    icon={DollarSign}
                />
                <StatsCard
                    title="Pertemuan"
                    value="84"
                    change="2.4%"
                    trend="down"
                    icon={CalendarCheck}
                />
                <StatsCard
                    title="Pertemuan Rata-rata"
                    value="18.6%"
                    change="5.1%"
                    trend="up"
                    icon={TrendingUp}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    {/* Removed outer card wrapper since AnalysisChart has its own */}
                    <AnalysisChart />
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-black text-primary tracking-tight">Appointments</h3>
                            <span className="text-accent-gold text-[10px] font-black uppercase tracking-widest mt-1 block">Today</span>
                        </div>
                    </div>

                    <div className="space-y-5 flex-1">
                        {bookings.slice(0, 4).map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 hover:bg-primary/5 rounded-3xl transition-all duration-500 group cursor-pointer border border-transparent hover:border-primary/5 hover:translate-x-1">
                                <div className="w-14 h-14 rounded-2xl bg-secondary shadow-sm flex flex-col items-center justify-center text-primary border border-primary/5 group-hover:bg-primary group-hover:text-secondary group-hover:border-primary transition-all duration-500">
                                    <span className="text-xs font-black leading-none">{item.time.split(':')[0]}</span>
                                    <span className="text-[10px] font-bold opacity-60 leading-none">{item.time.split(':')[1]}</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-primary text-sm tracking-tight">{item.name}</h4>
                                    <p className="text-[11px] text-primary/40 font-bold">{item.treatment}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm ${item.status === 'Confirmed' ? 'bg-primary/10 text-primary' :
                                        item.status === 'Waiting' ? 'bg-accent-gold/10 text-accent-gold' : 'bg-red-50 text-red-400'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-10 py-4 text-xs font-black text-primary uppercase tracking-widest border border-primary/10 rounded-2xl hover:bg-primary hover:text-secondary hover:border-primary hover:shadow-xl hover:shadow-primary/20 transition-all duration-500 active:scale-95">
                        View Full Schedule
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
