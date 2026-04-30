import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ReportModal from '../../components/UI/ReportModal';

const data = [
    { name: 'Mon', patients: 24, revenue: 1500 },
    { name: 'Tue', patients: 18, revenue: 1200 },
    { name: 'Wed', patients: 32, revenue: 2300 },
    { name: 'Thu', patients: 28, revenue: 1800 },
    { name: 'Fri', patients: 45, revenue: 3500 },
    { name: 'Sat', patients: 38, revenue: 3000 },
    { name: 'Sun', patients: 20, revenue: 1400 },
];

const AnalysisChart = () => {
    const [isReportOpen, setIsReportOpen] = useState(false);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-secondary-dark/20 h-full">
            <ReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                type="analytics"
            />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-primary">Analisis Pasien</h3>
                    <p className="text-sm text-primary-light">Monthly patient visits & procedure growth</p>
                </div>
                <button
                    onClick={() => setIsReportOpen(true)}
                    className="text-sm font-semibold text-primary hover:text-primary-light transition-colors border border-secondary-dark/20 px-4 py-2 rounded-lg hover:bg-secondary"
                >
                    View Full Report
                </button>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1B4D3E" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#1B4D3E" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="patients"
                            stroke="#1B4D3E"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorPatients)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AnalysisChart;
