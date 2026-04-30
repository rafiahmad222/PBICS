import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMockData } from '../../context/MockDataContext';
import { useToast } from '../../context/ToastContext';
import { ROLES } from '../../utils/rbac';

const NotificationWatcher = () => {
    const { user } = useAuth();
    const { products, leaveRequests, overtimeRequests } = useMockData();
    const { showToast } = useToast();
    const hasNotified = React.useRef(false);

    React.useEffect(() => {
        if (!user || hasNotified.current) return;

        // Gudang Notification
        if (user.role === ROLES.GUDANG_UMUM && products.length > 0) {
            const lowStockProducts = products.filter(p => p.stock <= p.minStock);
            if (lowStockProducts.length > 0) {
                const timer = setTimeout(() => {
                    showToast(`Peringatan: Ada ${lowStockProducts.length} produk dengan stok menipis!`, 'warning');
                    hasNotified.current = true;
                }, 1500);
                return () => clearTimeout(timer);
            }
        }

        // HRD Notification
        if (user.role === ROLES.HRD) {
            const pendingLeave = leaveRequests?.filter(r => r.status === 'Menunggu') || [];
            const pendingOvertime = overtimeRequests?.filter(r => r.status === 'Menunggu') || [];
            
            if (pendingLeave.length > 0 || pendingOvertime.length > 0) {
                const timer = setTimeout(() => {
                    let msg = '';
                    if (pendingLeave.length > 0) msg += `${pendingLeave.length} pengajuan cuti`;
                    if (pendingOvertime.length > 0) msg += (msg ? ' dan ' : '') + `${pendingOvertime.length} pengajuan lembur/anomali`;
                    
                    showToast(`Peringatan: Ada ${msg} yang menunggu persetujuan!`, 'info');
                    hasNotified.current = true;
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [user, products, leaveRequests, overtimeRequests, showToast]);

    return null;
};



const MainLayout = ({ children }) => {
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const location = useLocation();

    const toggleSidebar = () => {
        if (window.innerWidth < 768) {
            setIsMobileOpen(!isMobileOpen);
        } else {
            setIsDesktopCollapsed(!isDesktopCollapsed);
        }
    };

    return (
        <div className="flex min-h-screen bg-secondary-light">
            <NotificationWatcher />
            <Sidebar 
                isOpen={isMobileOpen} 
                toggle={toggleSidebar} 
                isCollapsed={isDesktopCollapsed}
                setIsCollapsed={setIsDesktopCollapsed}
                isHovered={isHovered}
                setIsHovered={setIsHovered}
            />
            <div className={`flex-1 flex flex-col min-h-screen relative z-10 transition-all duration-500 ${isDesktopCollapsed && !isHovered ? 'md:ml-[88px]' : 'ml-0 md:ml-64'}`}>
                <Header toggleSidebar={toggleSidebar} />
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div 
                        key={location.key}
                        className="max-w-7xl mx-auto animate-page-in"
                    >
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
