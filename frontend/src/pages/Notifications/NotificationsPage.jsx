import React, { useState } from 'react';
import { Bell, Search, Filter, Mail, MailOpen, Trash2, Calendar, User, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

const NotificationsPage = () => {
    const [filter, setFilter] = useState('all');

    const notifications = [
        {
            id: 1,
            type: 'appointment',
            title: 'New Appointment Booked',
            description: 'Siti Aminah has scheduled a Facial Treatment for Feb 10, 2024 at 10:00 AM.',
            time: '2 hours ago',
            read: false,
            icon: Calendar,
            color: 'text-blue-500',
            bg: 'bg-blue-50'
        },
        {
            id: 2,
            type: 'inventory',
            title: 'Low Stock Alert',
            description: 'Botox serum stock is below 5 units. Please restock soon.',
            time: '5 hours ago',
            read: false,
            icon: AlertCircle,
            color: 'text-red-500',
            bg: 'bg-red-50'
        },
        {
            id: 3,
            type: 'system',
            title: 'Software Update Success',
            description: 'The clinic management system has been updated to version 2.4.5.',
            time: 'Yesterday',
            read: true,
            icon: CheckCircle2,
            color: 'text-green-500',
            bg: 'bg-green-50'
        },
        {
            id: 4,
            type: 'customer',
            title: 'New Review Received',
            description: 'Budi Santoso left a 5-star review: "Excellent service and results!"',
            time: 'Yesterday',
            read: true,
            icon: User,
            color: 'text-yellow-500',
            bg: 'bg-yellow-50'
        },
        {
            id: 5,
            type: 'info',
            title: 'Team Meeting Reminder',
            description: 'Monthly staff meeting tomorrow at 08:00 AM in the conference room.',
            time: '2 days ago',
            read: true,
            icon: Info,
            color: 'text-primary',
            bg: 'bg-secondary'
        }
    ];

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Notifikasi</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm">Pusat informasi dan pemberitahuan aktivitas klinik</p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-all">
                        <MailOpen className="w-4 h-4" />
                        <span>Mark all as read</span>
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-all">
                        <Trash2 className="w-4 h-4" />
                        <span>Clear all</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="p-4 md:p-8 border-b border-primary/5 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 bg-secondary/10">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
                        {['all', 'unread', 'important'].map((opt) => (
                            <button
                                key={opt}
                                onClick={() => setFilter(opt)}
                                className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${filter === opt ? 'bg-primary text-secondary shadow-lg shadow-primary/20' : 'bg-white text-primary/40 border border-primary/5 hover:bg-primary/5 hover:text-primary'
                                    }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari notifikasi..."
                            className="w-full lg:w-64 pl-12 pr-6 py-3 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-xs font-bold text-primary"
                        />
                    </div>
                </div>

                <div className="divide-y divide-primary/5">
                    {notifications.map((notif) => (
                        <div key={notif.id} className={`p-6 md:p-8 border-b border-primary/5 last:border-0 flex flex-col sm:flex-row gap-6 md:gap-8 items-start ${!notif.read ? 'bg-secondary/20' : ''}`}>
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${notif.bg} flex items-center justify-center ${notif.color} shadow-sm shrink-0`}>
                                <notif.icon className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div className="flex-1 w-full">
                                <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                                    <h4 className={`text-base md:text-lg font-black tracking-tight ${!notif.read ? 'text-primary' : 'text-primary/60'}`}>{notif.title}</h4>
                                    <span className="text-[9px] md:text-[10px] font-black text-primary/30 uppercase tracking-widest">{notif.time}</span>
                                </div>
                                <p className={`text-xs md:text-sm leading-relaxed ${!notif.read ? 'text-primary/60 font-medium' : 'text-primary/40'}`}>{notif.description}</p>
                                {!notif.read && (
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <button className="px-4 py-2 rounded-lg bg-primary text-secondary text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">Lihat Detail</button>
                                        <button className="px-4 py-2 rounded-lg border border-primary/10 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary/5 transition-all">Tandai Selesai</button>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-row sm:flex-col items-center gap-4 ml-auto sm:ml-0">
                                {!notif.read && <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.5)]" title="Unread" />}
                                <button className="p-2 text-primary/20 transition-all">
                                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-10 border-t border-primary/5 bg-secondary/5 flex justify-center">
                    <button className="text-[10px] font-black text-primary/40 hover:text-primary uppercase tracking-widest transition-all">Load More Notifications</button>
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
