import React from 'react';

const StatsCard = ({ title, value, change, icon: Icon, trend = 'up' }) => {
    const isPositive = trend === 'up';
    const isRevenue = title === 'Revenue' || title.toLowerCase().includes('revenue');

    return (
        <div className="group bg-white p-7 rounded-[2.5rem] border border-primary/10 shadow-xl shadow-primary/[0.08] hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/15 relative overflow-hidden active:scale-[0.98] h-full flex flex-col justify-between">
            {/* Decorative background element */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-15 transition-opacity duration-500 group-hover:opacity-25 ${isPositive ? 'bg-primary' : 'bg-red-500'}`} />

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-primary/60 text-[10px] uppercase tracking-[0.2em] font-black mb-2">{title}</p>
                    <div className="flex items-baseline gap-1">
                        <h3 className={`${typeof value === 'string' && value.length > 10 ? 'text-lg lg:text-xl' : typeof value === 'string' ? 'text-xl lg:text-2xl' : 'text-2xl lg:text-3xl'} font-black text-primary tracking-tighter leading-none`}>{value}</h3>
                        {isRevenue && !value.toString().includes('Rp') && <span className="text-primary/20 text-xs font-bold leading-none ml-0.5">K</span>}
                    </div>
                </div>
                <div className={`p-3.5 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg flex-shrink-0 ${isPositive ? 'bg-primary text-secondary shadow-primary/20' : 'bg-red-500 text-white shadow-red-500/20'}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>

            {change && (
                <div className="mt-8 flex items-center gap-3 relative z-10">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-wider shadow-sm ${isPositive ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-600'}`}>
                        {isPositive ? '↑' : '↓'} {change}
                    </div>
                    <span className="text-primary/50 text-[10px] font-bold uppercase tracking-[0.1em] leading-none">Growth</span>
                </div>
            )}
        </div>
    );
};

export default StatsCard;
