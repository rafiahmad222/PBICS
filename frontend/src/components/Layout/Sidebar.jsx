import React, { useState } from 'react';
import {
    Squares2X2Icon,
    DocumentTextIcon,
    UserIcon,
    UsersIcon,
    ShoppingCartIcon,
    CalendarDaysIcon,
    ChartBarIcon,
    KeyIcon,
    XMarkIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    TagIcon,
    ArchiveBoxIcon,
    FingerPrintIcon,
    SparklesIcon,
} from '@heroicons/react/24/solid';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/logo.png';
import logo1 from '../../assets/logo-1.png';
import { useAuth } from '../../context/AuthContext';
import { hasPermission, ROLES } from '../../utils/rbac';

const ALL_NAV_ITEMS = [
    { icon: Squares2X2Icon, label: 'Dashboard', path: '/' },
    { icon: DocumentTextIcon, label: 'Rekam Medis', path: '/medical-records' },
    { icon: UserIcon, label: 'Pasien', path: '/patients' },
    { icon: UsersIcon, label: 'Manajemen Karyawan', path: '/staff' },
    { 
        icon: ArchiveBoxIcon, 
        label: 'Stok', 
        path: '/management'
    },
    { icon: ShoppingCartIcon, label: 'Transaksi', path: '/sales' },
    { icon: CalendarDaysIcon, label: 'Reservasi', path: '/reservations' },
    { icon: FingerPrintIcon, label: 'Absensi', path: '/attendance' },
    { icon: TagIcon, label: 'Promo', path: '/promos' },
    { icon: ChartBarIcon, label: 'Laporan', path: '/reports' },
    { icon: ArchiveBoxIcon, label: 'Stok', path: '/cs-products' },
    { icon: ArchiveBoxIcon, label: 'Stok', path: '/apotek-inventory' },
    { icon: ArchiveBoxIcon, label: 'Stok', path: '/superadmin-inventory' },
    { icon: SparklesIcon, label: 'Treatment', path: '/cs-treatments' },
];

const Sidebar = ({ isOpen, toggle, isCollapsed, setIsCollapsed, isHovered, setIsHovered }) => {
    const { user } = useAuth();
    const [openMenu, setOpenMenu] = useState(null);

    const effectivelyCollapsed = isCollapsed && !isHovered;

    const toggleMenu = (label) => {
        setOpenMenu(prev => prev === label ? null : label);
    };

    const handleItemClick = () => {
        if (window.innerWidth < 768 && isOpen) {
            toggle();
        } else if (window.innerWidth >= 768) {
            setIsCollapsed(true);
            setOpenMenu(null);
        }
    };

    const navItems = ALL_NAV_ITEMS.filter(item => {
        if (item.subItems && item.subItems.length > 0) {
            return item.subItems.some(sub => hasPermission(user?.role, sub.path));
        }
        return hasPermission(user?.role, item.path);
    }).map(item => {
        if (item.path === '/staff' && (user?.role === 'Owner' || user?.role === 'Komisaris' || user?.role === 'HRD' || user?.role === 'Super Admin')) {
            return { ...item, label: 'Manajemen Karyawan' };
        }
        if (item.path === '/promos') {
            if (user?.role === ROLES.SUPERVISOR_TREATMENT) return { ...item, label: 'Promo Treatment' };
            if (user?.role === ROLES.SUPERVISOR_PRODUK) return { ...item, label: 'Promo Produk' };
        }
        if (item.path === '/cs-products' && user?.role === ROLES.SUPERVISOR_PRODUK) {
            return { ...item, label: 'Stok' };
        }
        return item;
    });

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[45] md:hidden" onClick={toggle} />
            )}

            {/* UBAH STRUKTUR KELAS ASIDE DI SINI */}
            <aside 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`fixed left-0 top-0 h-screen bg-white flex flex-col z-50 border-r border-gray-200 transition-all duration-500 ease-in-out ${effectivelyCollapsed ? 'w-64 md:w-[88px]' : 'w-64'} ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
            >
                
                {/* 1. HEADER (Fixed/Tetap di atas) */}
                <div className={`bg-primary px-4 h-16 flex items-center shrink-0 ${effectivelyCollapsed ? 'justify-center md:px-0' : 'justify-between'}`}>
                    <div className="flex items-center gap-2 shrink-0 overflow-hidden">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-white/20 shrink-0 bg-white">
                            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <img src={logo1} alt="Logo Text" className={`h-auto object-contain shrink-0 transition-all duration-300 ${effectivelyCollapsed ? 'w-0 opacity-0 md:hidden' : 'w-32 opacity-100'}`} />
                    </div>
                    <button onClick={toggle} className={`md:hidden p-2 text-white/50 hover:text-white transition-colors ${effectivelyCollapsed ? 'hidden' : ''}`}>
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* 2. NAV ITEMS (Bisa di-scroll, menggunakan flex-1) */}
                <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto scrollbar-hide">
                    {navItems.length === 0 && (
                        <div className="text-center p-3 mb-2 rounded-lg bg-red-50 text-red-500 text-xs font-bold border border-red-200">
                            Error: Role "{user?.role}" tidak punya izin akses.
                        </div>
                    )}

                    {navItems.map((item) => {
                        const isExpanded = openMenu === item.label;
                        const hasSubs = item.subItems && item.subItems.length > 0;
                        const allowedSubs = hasSubs ? item.subItems.filter(s => hasPermission(user?.role, s.path)) : [];

                        if (hasSubs && allowedSubs.length > 0) {
                            return (
                                <div key={item.label} className="space-y-1">
                                    <button
                                        onClick={() => {
                                            if (isCollapsed && !isHovered) setIsCollapsed(false);
                                            toggleMenu(item.label);
                                        }}
                                        className={`w-full flex items-center justify-between rounded-xl transition-all duration-200 text-gray-500 hover:text-primary hover:bg-primary/5 ${effectivelyCollapsed ? 'p-3 md:justify-center' : 'px-4 py-3'}`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <item.icon className="w-5 h-5 flex-shrink-0" />
                                            <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${effectivelyCollapsed ? 'w-0 opacity-0 md:hidden' : 'w-auto opacity-100'}`}>{item.label}</span>
                                        </div>
                                        {effectivelyCollapsed ? null : (isExpanded ? <ChevronUpIcon className="w-4 h-4 shrink-0" /> : <ChevronDownIcon className="w-4 h-4 shrink-0" />)}
                                    </button>
                                    
                                    {isExpanded && !effectivelyCollapsed && (
                                        <div className="ml-9 space-y-1 border-l border-gray-100 pl-2">
                                            {allowedSubs.map((sub) => (
                                                <NavLink
                                                    key={sub.path}
                                                    to={sub.path}
                                                    onClick={handleItemClick}
                                                    className={({ isActive }) =>
                                                        `flex items-center px-4 py-2 rounded-lg text-xs font-semibold transition-all ${isActive ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-primary hover:bg-primary/5'}`
                                                    }
                                                >
                                                    {sub.label}
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        if (!hasSubs) {
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={handleItemClick}
                                    className={({ isActive }) =>
                                        `flex items-center overflow-hidden rounded-xl transition-all duration-200 group ${isActive ? 'text-white bg-primary shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-primary hover:bg-primary/5'} ${effectivelyCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}`
                                    }
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${effectivelyCollapsed ? 'w-0 opacity-0 md:hidden' : 'w-auto opacity-100'}`}>{item.label}</span>
                                </NavLink>
                            );
                        }
                        return null;
                    })}
                </nav>

            </aside>
        </>
    );
};

export default Sidebar;
