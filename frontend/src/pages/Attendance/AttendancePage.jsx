import React, { useState, useEffect } from 'react';
import {
    CalendarDays, Clock, UserCheck, UserMinus, Search, Filter,
    MoreHorizontal, CheckCircle2, XCircle, LogOut, Camera,
    Calendar, Edit3, Download, FileText, ChevronRight, Moon,
    AlertTriangle, MapPin, Briefcase
} from 'lucide-react';
import FaceScanModal from '../../components/UI/FaceScanModal';
import AttendanceDetailModal from '../../components/UI/AttendanceDetailModal';
import LeaveRequestModal from '../../components/UI/LeaveRequestModal';
import LeaveApprovalModal from '../../components/UI/LeaveApprovalModal';
import OvertimeNoteModal from '../../components/UI/OvertimeNoteModal';
import OvertimeApprovalModal from '../../components/UI/OvertimeApprovalModal';
import CustomSelect from '../../components/UI/CustomSelect';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useMockData } from '../../context/MockDataContext';
import { getActiveShift } from '../../utils/shiftConfig';
import TableSkeleton from '../../components/UI/TableSkeleton';
import StatsCard from '../Dashboard/StatsCard';


const AttendancePage = () => {
    const { showToast } = useToast();
    const { user } = useAuth();



    // ─── Global States ─────────────────────────────────────────────────────────
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('attendance');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isRamadhan, setIsRamadhan] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, [activeTab]); // Reload skeleton when tab changes for better UX

    // ─── Modal States ───────────────────────────────────────────────────────────
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [scanType, setScanType] = useState('in');
    const [selectedStaffId, setSelectedStaffId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailStaff, setDetailStaff] = useState(null);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [selectedLeaveRequest, setSelectedLeaveRequest] = useState(null);

    // Overtime Modal States
    const [isOvertimeNoteOpen, setIsOvertimeNoteOpen] = useState(false);
    const [pendingAnomalyData, setPendingAnomalyData] = useState(null);
    const [pendingPhotoUrl, setPendingPhotoUrl] = useState(null);
    const [isOvertimeApprovalOpen, setIsOvertimeApprovalOpen] = useState(false);
    const [selectedOvertimeReq, setSelectedOvertimeReq] = useState(null);

    // ─── Role Checks ────────────────────────────────────────────────────────────
    const canAccessReports = user?.role === 'Owner' || user?.role === 'Komisaris' || user?.role === 'HRD';
    const canApproveLeave = user?.role === 'HRD';

    // ─── Mock Data: Attendance Stats ────────────────────────────────────────────
    const [attendanceStats] = useState([
        { title: 'Hadir Hari Ini', value: '24', total: '26', icon: UserCheck, color: 'text-green-500' },
        { title: 'Izin / Sakit', value: '2', total: '26', icon: UserMinus, color: 'text-yellow-500' },
        { title: 'Terlambat', value: '3', total: '24', icon: Clock, color: 'text-red-500' },
        { title: 'Rata-rata Kehadiran', value: '96%', icon: CalendarDays, color: 'text-primary' },
    ]);

    // ─── Mock Data: Staff Attendance ─────────────────────────────────────────────
    const [staffAttendance, setStaffAttendance] = useState([
        { name: 'Dr. Sarah Smith', role: 'Dokter', shift: 'pelayanan_pagi', checkIn: '08:45', checkOut: '17:15', status: 'Hadir', date: '2026-04-18', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop' },
        { name: 'Linda Rahayu', role: 'Perawat', shift: 'pelayanan_siang', checkIn: '10:30', checkOut: '19:05', status: 'Hadir', date: '2026-04-18', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop' },
        { name: 'Andi Pratama', role: 'Customer Service', shift: 'pelayanan_pagi', checkIn: '09:15', checkOut: '--:--', status: 'Terlambat', date: '2026-04-18', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: null },
        { name: 'Maya Sari', role: 'Perawat', shift: 'pelayanan_pagi', checkIn: '--:--', checkOut: '--:--', status: 'Izin', date: '2026-04-18', photoIn: null, photoOut: null },
        { name: 'Bambang Heru', role: 'OB', shift: 'ob_normal', checkIn: '07:00', checkOut: '17:00', status: 'Hadir', date: '2026-04-18', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop' },
        { name: 'Ayu Lestari', role: 'Customer Service', shift: 'pelayanan_siang', checkIn: '10:30', checkOut: '19:00', status: 'Hadir', date: '2026-04-18', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop' },
        { name: 'Dewi Rahmawati', role: 'HRD', shift: 'umum_normal', checkIn: '08:00', checkOut: '17:00', status: 'Hadir', date: '2026-04-18', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop' },
        { name: 'Fajar Nugroho', role: 'Supervisor Treatment', shift: 'umum_normal', checkIn: '09:30', checkOut: '--:--', status: 'Terlambat', date: '2026-04-18', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: null },
        { name: 'Rina Kartika', role: 'Perawat', shift: 'pelayanan_pagi', checkIn: '08:45', checkOut: '17:00', status: 'Hadir', date: '2026-04-18', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop' },
        { name: 'Agus Setiawan', role: 'Perawat', shift: 'pelayanan_siang', checkIn: '--:--', checkOut: '--:--', status: 'Sakit', date: '2026-04-18', photoIn: null, photoOut: null },
        { name: 'Reza Pahlevi', role: 'Kasir', shift: 'umum_normal', checkIn: '08:00', checkOut: '--:--', status: 'Hadir', date: '2026-04-18', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: null },
        { name: 'Nina Wulandari', role: 'Kasir', shift: 'umum_normal', checkIn: '--:--', checkOut: '--:--', status: 'Cuti', date: '2026-04-18', photoIn: null, photoOut: null },
        { name: 'Hendra Saputra', role: 'Satpam', shift: 'satpam_pagi', checkIn: '07:30', checkOut: '--:--', status: 'Hadir', date: '2026-04-18', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: null },
    ]);

    const { 
        leaveRequests, updateLeaveStatus, addLeaveRequest,
        overtimeRequests, updateOvertimeStatus, addOvertimeRequest 
    } = useMockData();

    const handleOpenScan = (type, staffId = null) => {
        setScanType(type);
        setSelectedStaffId(staffId);
        setIsScanModalOpen(true);
    };

    const handleOpenDetail = (staff) => {
        setDetailStaff(staff);
        setIsDetailModalOpen(true);
    };

    const handleAttend = () => {
        const myAttendance = staffAttendance.find(s => s.name === user?.name);
        const hasCheckedIn = myAttendance && myAttendance.checkIn !== '--:--';
        const hasCheckedOut = myAttendance && myAttendance.checkOut !== '--:--';

        if (!hasCheckedIn) {
            handleOpenScan('in');
        } else if (!hasCheckedOut) {
            handleOpenScan('out', myAttendance.id);
        } else {
            showToast('Anda sudah menyelesaikan absensi hari ini.', 'info');
        }
    };

    // Shift karyawan yang sedang login (dari Data Karyawan)
    const myStaffRecord = staffAttendance.find(s => s.name === user?.name);
    const myShift = myStaffRecord?.shift || 'umum_normal';

    const handleScanSuccess = (photoUrl, anomalyInfo) => {
        const currentTime = anomalyInfo?.detectedTime || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        if (scanType === 'in') {
            let newStatus = 'Hadir';
            if (anomalyInfo?.isLate) newStatus = 'Terlambat';

            setStaffAttendance(prev => {
                const existingIndex = prev.findIndex(s => s.name === user?.name);
                if (existingIndex !== -1) {
                    return prev.map((s, i) => i === existingIndex ? { ...s, checkIn: currentTime, photoIn: photoUrl, status: newStatus } : s);
                } else {
                    return [
                        ...prev,
                        {
                            id: `STF-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                            name: user?.name, role: user?.role, shift: myShift,
                            checkIn: currentTime, checkOut: '--:--', status: newStatus,
                            date: new Date().toISOString().split('T')[0], photoIn: photoUrl, photoOut: null
                        }
                    ];
                }
            });
        } else {
            const targetId = selectedStaffId || staffAttendance.find(s => s.name === user?.name)?.id;
            if (targetId) {
                setStaffAttendance(prev => prev.map(staff =>
                    staff.id === targetId ? { ...staff, checkOut: currentTime, photoOut: photoUrl } : staff
                ));
            }
        }

        setIsScanModalOpen(false);

        // Jika ada anomali â†’ buka modal notes
        if (anomalyInfo && (anomalyInfo.isLate || anomalyInfo.isOvertime || anomalyInfo.isOutside)) {
            setPendingAnomalyData(anomalyInfo);
            setPendingPhotoUrl(photoUrl);
            setIsOvertimeNoteOpen(true);
        } else {
            showToast(
                scanType === 'in'
                    ? `Check-in berhasil! Selamat bekerja.`
                    : `Check-out berhasil! Sampai jumpa.`,
                'success'
            );
        }
    };

    const handleOvertimeNoteSubmit = (data) => {
        const newRequest = {
            id: `OT-${Math.floor(Math.random() * 9000 + 1000)}`,
            staffName: user?.name,
            role: user?.role,
            shift: myShift,
            primaryType: data.primaryType,
            anomalyTypes: data.anomalyTypes,
            scheduledTime: data.scheduledTime,
            detectedTime: data.detectedTime,
            diffMinutes: data.diffMinutes,
            notes: data.notes,
            date: new Date().toISOString().split('T')[0],
            status: 'Menunggu',
            hrdNote: ''
        };
        addOvertimeRequest(newRequest);
        setIsOvertimeNoteOpen(false);
        setPendingAnomalyData(null);
        showToast('Pengajuan berhasil dikirim ke HRD untuk review.', 'success');
    };


    // ─── Filter Logic ─────────────────────────────────────────────────────────────
    const filteredManagerAttendance = staffAttendance.filter(record => {
        const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.role.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'Semua Status' || record.status === statusFilter;
        let matchesDate = true;
        if (startDate && endDate) matchesDate = record.date >= startDate && record.date <= endDate;
        else if (startDate) matchesDate = record.date >= startDate;
        else if (endDate) matchesDate = record.date <= endDate;
        return matchesSearch && matchesStatus && matchesDate;
    });

    const finalAttendance = canAccessReports ? filteredManagerAttendance : staffAttendance.filter(record =>
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredLeave = leaveRequests.filter(req =>
        req.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredOvertime = overtimeRequests.filter(req =>
        req.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.primaryType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingOvertimeCount = overtimeRequests.filter(r => r.status === 'Menunggu').length;

    // ─── Styling Helpers ─────────────────────────────────────────────────────────
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Hadir': return 'bg-green-100 text-green-600';
            case 'Terlambat': return 'bg-yellow-100 text-yellow-600';
            case 'Sakit': case 'Izin': case 'Cuti': return 'bg-blue-100 text-blue-600';
            case 'Alpa': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    const getOvertimeTypeStyle = (type) => {
        switch (type) {
            case 'Terlambat': return 'bg-amber-100 text-amber-700';
            case 'Lembur': return 'bg-orange-100 text-orange-700';
            case 'Luar Kantor': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    const getOvertimeStatusStyle = (status) => {
        switch (status) {
            case 'Disetujui': return 'bg-green-100 text-green-600';
            case 'Ditolak':   return 'bg-red-100 text-red-600';
            default:          return 'bg-yellow-100 text-yellow-700';
        }
    };

    // ─── Pagination ───────────────────────────────────────────────────────────────
    const [attendancePage, setAttendancePage] = useState(1);
    const [leavePage, setLeavePage] = useState(1);
    const [overtimePage, setOvertimePage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setAttendancePage(1);
        setLeavePage(1);
        setOvertimePage(1);
    }, [searchTerm, statusFilter, startDate, endDate, activeTab]);

    const idxLastAttendance = attendancePage * itemsPerPage;
    const idxFirstAttendance = idxLastAttendance - itemsPerPage;
    const currentAttendance = finalAttendance.slice(idxFirstAttendance, idxLastAttendance);
    const totalAttendancePages = Math.ceil(finalAttendance.length / itemsPerPage);

    const idxLastLeave = leavePage * itemsPerPage;
    const idxFirstLeave = idxLastLeave - itemsPerPage;
    const currentLeave = filteredLeave.slice(idxFirstLeave, idxLastLeave);
    const totalLeavePages = Math.ceil(filteredLeave.length / itemsPerPage);

    const idxLastOvertime = overtimePage * itemsPerPage;
    const idxFirstOvertime = idxLastOvertime - itemsPerPage;
    const currentOvertime = filteredOvertime.slice(idxFirstOvertime, idxLastOvertime);
    const totalOvertimePages = Math.ceil(filteredOvertime.length / itemsPerPage);

    const handleExport = () => {
        let csvContent = "sep=,\n";
        if (activeTab === 'attendance') {
            csvContent += "ID,nama karyawan,Role,Shift,Tanggal,Jam Masuk,Jam Keluar,Status\n";
            finalAttendance.forEach(record => {
                csvContent += `${record.id},"${record.name}","${record.role}","${record.shift}",${record.date},${record.checkIn},${record.checkOut},${record.status}\n`;
            });
        } else if (activeTab === 'leave') {
            csvContent += "ID,nama karyawan,Role,Jenis Pengajuan,Tanggal Mulai,Tanggal Selesai,Alasan,Status\n";
            filteredLeave.forEach(req => {
                csvContent += `${req.id},"${req.staffName}","${req.role}","${req.type}",${req.startDate},${req.endDate},"${req.reason}",${req.status}\n`;
            });
        } else {
            csvContent += "ID,nama karyawan,Role,Shift,Jenis,Jam Jadwal,Jam Aktual,Keterangan,Status\n";
            filteredOvertime.forEach(req => {
                csvContent += `${req.id},"${req.staffName}","${req.role}","${req.shift}","${req.primaryType}",${req.scheduledTime},${req.detectedTime},"${req.notes}",${req.status}\n`;
            });
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        const tabLabel = activeTab === 'attendance' ? 'Kehadiran' : activeTab === 'leave' ? 'Cuti' : 'Lembur';
        link.setAttribute("download", `Laporan_${tabLabel}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Laporan berhasil diexport ke format Excel', 'success');
    };

    // Ambil info shift aktif user yang login (untuk tampil di header)
    const myActiveShift = getActiveShift(myShift, isRamadhan);

    return (
        <div className="space-y-10 animate-fade-in pb-12">

            {/* ─── Modals ─────────────────────────────────────────────────────── */}
            <FaceScanModal
                isOpen={isScanModalOpen}
                onClose={() => setIsScanModalOpen(false)}
                onScanSuccess={handleScanSuccess}
                type={scanType}
                employeeShift={myShift}
                isRamadhan={isRamadhan}
            />
            <AttendanceDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} staffData={detailStaff} />
            <LeaveApprovalModal
                isOpen={isApprovalModalOpen}
                onClose={() => setIsApprovalModalOpen(false)}
                requestData={selectedLeaveRequest}
                showActions={canApproveLeave}
                onUpdateStatus={updateLeaveStatus}
            />
            <LeaveRequestModal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} onSubmit={(data) => {
                const newRequest = { id: `LR-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`, staffName: user?.name, role: user?.role, type: data.leaveType, startDate: data.startDate, endDate: data.endDate, reason: data.reason, attachment: data.attachment, status: 'Menunggu' };
                addLeaveRequest(newRequest);
            }} />

            <OvertimeNoteModal
                isOpen={isOvertimeNoteOpen}
                onClose={() => { setIsOvertimeNoteOpen(false); setPendingAnomalyData(null); showToast('Absensi tercatat. Pengajuan dibatalkan.', 'info'); }}
                onSubmit={handleOvertimeNoteSubmit}
                anomalyData={pendingAnomalyData}
                employeeName={user?.name}
            />
            <OvertimeApprovalModal
                isOpen={isOvertimeApprovalOpen}
                onClose={() => setIsOvertimeApprovalOpen(false)}
                requestData={selectedOvertimeReq}
                showActions={canApproveLeave}
                onUpdateStatus={updateOvertimeStatus}
            />


            {/* ─── Header Section ─────────────────────────────────────────────── */}
            {canAccessReports ? (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Rekap Absensi</h2>
                            {/* Ramadhan Toggle */}
                            <button
                                onClick={() => { setIsRamadhan(r => !r); showToast(`Mode Ramadhan ${!isRamadhan ? 'diaktifkan' : 'dinonaktifkan'}`, 'info'); }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${isRamadhan ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' : 'bg-white text-primary/40 border-primary/10 hover:border-amber-400 hover:text-amber-500'}`}
                                title={isRamadhan ? 'Nonaktifkan Mode Ramadhan' : 'Aktifkan Mode Ramadhan'}
                            >
                                <Moon className="w-3 h-3" />
                                <span>{isRamadhan ? 'Ramadhan On' : 'Mode Ramadhan'}</span>
                            </button>
                        </div>
                        <p className="text-primary/40 font-bold text-sm">Pantau kehadiran dan kedisiplinan seluruh karyawan klinik</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        {user?.role === 'HRD' && (
                            <>
                                <button onClick={() => setIsLeaveModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-secondary text-primary border-2 border-primary px-6 py-4 rounded-2xl hover:bg-primary/5 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-sm">
                                    <CalendarDays className="w-4 h-4" />
                                    <span>Cuti</span>
                                </button>
                                <button onClick={handleAttend} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-6 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
                                    <Camera className="w-4 h-4" />
                                    <span>Absen</span>
                                </button>
                            </>
                        )}
                        <button onClick={handleExport} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
                            <Download className="w-4 h-4" />
                            <span>Export Laporan</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Kehadiran Karyawan</h2>
                        {/* Tampilkan info shift karyawan */}
                        {myActiveShift && (
                            <div className="flex items-center gap-2 mt-3">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/10">
                                    <Briefcase className="w-3 h-3 text-primary/50" />
                                    <span className="text-[10px] font-black text-primary/50 uppercase tracking-widest">Shift {myActiveShift.label}</span>
                                    <span className="w-1 h-1 rounded-full bg-primary/20" />
                                    <span className="text-[10px] font-black text-primary/70">{myActiveShift.checkIn} – {myActiveShift.checkOut}</span>
                                    {isRamadhan && <span className="ml-1 text-[9px] font-black text-amber-500 flex items-center gap-1"><Moon className="w-2.5 h-2.5" />Ramadhan</span>}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <button onClick={handleAttend} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
                            <Camera className="w-4 h-4" />
                            <span>Absen Sekarang</span>
                        </button>
                        <button onClick={() => setIsLeaveModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-secondary text-primary border-2 border-primary px-8 py-4 rounded-2xl hover:bg-primary/5 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-sm">
                            <CalendarDays className="w-4 h-4" />
                            <span>Pengajuan Cuti</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ─── Navigation Tabs ────────────────────────────────────────────── */}
            <div className="flex border-b border-primary/10 mb-8 mt-4 gap-8">
                <button onClick={() => setActiveTab('attendance')} className={`pb-4 text-[10px] md:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'attendance' ? 'text-primary border-b-2 border-primary' : 'text-primary/30 hover:text-primary/60'}`}>
                    Data Kehadiran
                </button>
                <button onClick={() => setActiveTab('leave')} className={`pb-4 text-[10px] md:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'leave' ? 'text-primary border-b-2 border-primary' : 'text-primary/30 hover:text-primary/60'}`}>
                    Pengajuan Cuti / Izin
                </button>
                {canAccessReports && (
                    <button onClick={() => setActiveTab('overtime')} className={`pb-4 text-[10px] md:text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'overtime' ? 'text-primary border-b-2 border-primary' : 'text-primary/30 hover:text-primary/60'}`}>
                        Pengajuan Lembur
                        {pendingOvertimeCount > 0 && (
                            <span className="absolute -top-1 -right-3 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center animate-pulse">
                                {pendingOvertimeCount}
                            </span>
                        )}
                    </button>
                )}
            </div>

            {/* ─── Content Area ────────────────────────────────────────────────── */}

            {/* â•â•â• TAB 1: DATA KEHADIRAN â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
            {activeTab === 'attendance' && (
                <div className="space-y-8">
                    {/* Stats Cards */}
                    {canAccessReports ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2.5 text-primary/60">
                                <CalendarDays className="w-5 h-5" />
                                <span className="text-sm md:text-base font-black uppercase tracking-widest mt-0.5">
                                    Hari ini, {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                {isRamadhan && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-[9px] font-black uppercase tracking-widest"><Moon className="w-3 h-3" />Mode Ramadhan Aktif</span>}
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                                {[
                                    { label: 'Hadir Tepat Waktu', value: '24', icon: CheckCircle2, trend: 'up' },
                                    { label: 'Terlambat', value: '3', icon: Clock, trend: 'down' },
                                    { label: 'Sakit / Izin / Cuti', value: '5', icon: FileText, trend: 'down' },
                                    { label: 'Tanpa Keterangan', value: '1', icon: XCircle, trend: 'down' }
                                ].map((stat, idx) => (
                                    <StatsCard 
                                        key={idx} 
                                        title={stat.label} 
                                        value={stat.value} 
                                        icon={stat.icon} 
                                        trend={stat.trend} 
                                    />
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {/* Table Area */}
                    <div className="bg-white rounded-[2rem] md:rounded-[1rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                        {/* Filters */}
                        {canAccessReports ? (
                            <div className="p-4 md:p-8 border-b border-primary/5 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 bg-primary/5">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                                    <input type="text" placeholder="Cari nama karyawan atau divisi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all" />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex items-center gap-2 relative z-50 bg-white border border-primary/5 rounded-2xl px-4 py-2 shadow-sm focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                                        <Calendar className="w-4 h-4 text-primary/30" />
                                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent border-none outline-none text-primary font-bold text-[10px] md:text-xs" />
                                        <span className="text-primary/30 text-xs font-bold">-</span>
                                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent border-none outline-none text-primary font-bold text-[10px] md:text-xs" />
                                    </div>
                                    <div className="w-full sm:w-48 relative z-40">
                                        <CustomSelect value={statusFilter} onChange={setStatusFilter} options={[
                                            { value: 'Semua Status', label: 'Semua Status' },
                                            { value: 'Hadir', label: 'Hadir' },
                                            { value: 'Terlambat', label: 'Terlambat' },
                                            { value: 'Sakit', label: 'Sakit' },
                                            { value: 'Cuti', label: 'Cuti' },
                                            { value: 'Alpa', label: 'Alpa' }
                                        ]} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 md:p-8 border-b border-primary/5 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 bg-secondary/10">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                                    <input type="text" placeholder="Cari Nama Karyawan atau divisi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" />
                                </div>
                            </div>
                        )}

                        {isLoading ? (
                            <TableSkeleton rows={itemsPerPage} columns={canAccessReports ? 7 : 5} />
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5 bg-gray-50/30">
                                        <th className="px-4 py-3 text-primary/80">{canAccessReports ? 'nama karyawan' : 'Karyawan'}</th>
                                        <th className="px-4 py-3 text-primary/80">{canAccessReports ? 'Tanggal' : 'Divisi'}</th>
                                        {canAccessReports && <th className="px-4 py-3 text-primary/80">Shift</th>}
                                        <th className="px-4 py-3 text-center text-primary/80">Jam Masuk</th>
                                        <th className="px-4 py-3 text-center text-primary/80">Jam Keluar</th>
                                        {canAccessReports && <th className="px-4 py-3 text-center text-primary/80">Durasi</th>}
                                        <th className="px-4 py-3 text-center text-primary/80">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5">
                                    {currentAttendance.map((record) => {
                                        const recordShift = getActiveShift(record.shift, isRamadhan);
                                        return (
                                            <tr key={record.id} onClick={() => handleOpenDetail(record)} className="border-b border-primary/5 last:border-0 hover:bg-primary/[0.02] transition-colors cursor-pointer">
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-secondary shadow-sm flex items-center justify-center text-primary font-medium text-xs border border-primary/5 shrink-0">
                                                            {record.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-primary text-sm tracking-tight">{record.name}</div>
                                                            <div className="text-[10px] text-primary/40 font-bold uppercase tracking-widest mt-0.5">
                                                                {canAccessReports ? record.role : record.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-primary/80 font-medium text-sm tracking-tight">
                                                    {canAccessReports ? record.date : <span className="text-sm font-medium text-primary/60">{record.role}</span>}
                                                </td>
                                                {canAccessReports && (
                                                    <td className="px-4 py-2">
                                                        <span className="text-[10px] font-black text-primary/50 bg-primary/5 px-2 py-1 rounded-lg">
                                                            {recordShift?.label || record.shift}
                                                        </span>
                                                        <p className="text-[9px] text-primary/30 font-bold mt-0.5">{recordShift?.checkIn}–{recordShift?.checkOut}</p>
                                                    </td>
                                                )}
                                                <td className="px-4 py-2 text-center">
                                                    {!canAccessReports && <div className={`w-1.5 h-1.5 rounded-full inline-block mr-2 ${record.checkIn === '--:--' ? 'bg-primary/10' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'}`} />}
                                                    <span className={`font-medium text-sm ${record.checkIn !== '--:--' ? 'text-primary' : 'text-primary/20'}`}>{record.checkIn}</span>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <span className={`font-medium text-sm ${record.checkOut !== '--:--' ? 'text-primary' : 'text-primary/20'}`}>{record.checkOut}</span>
                                                </td>
                                                {canAccessReports && (
                                                    <td className="px-4 py-2 text-center text-primary/80 font-medium text-sm tracking-tight">
                                                        {record.checkIn !== '--:--' && record.checkOut !== '--:--' ? '8j 15m' : '-'}
                                                    </td>
                                                )}
                                                <td className="px-4 py-2 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border border-white/50 ${getStatusStyle(record.status)}`}>
                                                        {record.status === 'Hadir' ? <CheckCircle2 className="w-3 h-3" /> : record.status === 'Terlambat' ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                        {record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-primary/5">
                            {currentAttendance.map((record) => {
                                const recordShift = getActiveShift(record.shift, isRamadhan);
                                return (
                                    <div key={record.id} onClick={() => handleOpenDetail(record)} className="p-6 space-y-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-secondary shadow-sm flex items-center justify-center text-primary font-black text-xs border border-primary/5">
                                                    {record.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-primary tracking-tight">{record.name}</h4>
                                                    <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">{record.role}</p>
                                                    {recordShift && <p className="text-[9px] font-bold text-primary/20 mt-0.5">Shift {recordShift.label} · {recordShift.checkIn}–{recordShift.checkOut}</p>}
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${getStatusStyle(record.status)}`}>
                                                {record.status === 'Hadir' ? <CheckCircle2 className="w-2 h-2" /> : record.status === 'Terlambat' ? <Clock className="w-2 h-2" /> : <XCircle className="w-2 h-2" />}
                                                {record.status}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 bg-gray-50/50 p-4 rounded-2xl border border-primary/5">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-primary/30 uppercase tracking-widest leading-none">Masuk</p>
                                                <p className={`text-xs font-bold ${record.checkIn !== '--:--' ? 'text-primary' : 'text-primary/20'}`}>{record.checkIn}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-primary/30 uppercase tracking-widest leading-none">Keluar</p>
                                                <p className={`text-xs font-bold ${record.checkOut !== '--:--' ? 'text-primary' : 'text-primary/20'}`}>{record.checkOut}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold text-primary/30 px-1">
                                            <span>{record.date}</span>
                                            <div className="flex items-center gap-1"><span>Detail</span><ChevronRight className="w-3 h-3" /></div>
                                        </div>
                                    </div>
                                );
                            })}
                            {finalAttendance.length === 0 && (
                                <div className="p-12 text-center text-primary/20 font-black uppercase text-[10px] tracking-widest">Tidak ada data kehadiran</div>
                            )}
                        </div>
                            </>
                        )}

                        {/* Pagination */}
                        <div className="p-6 md:p-8 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40 bg-primary/5">
                            <span>Menampilkan {finalAttendance.length === 0 ? 0 : idxFirstAttendance + 1} hingga {Math.min(idxLastAttendance, finalAttendance.length)} dari {finalAttendance.length} data</span>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button onClick={() => setAttendancePage(p => Math.max(1, p - 1))} disabled={attendancePage === 1} className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-primary/10 bg-white hover:bg-gray-50 text-primary transition-all duration-300 disabled:opacity-30 active:scale-95 shadow-sm">Sebelumnya</button>
                                <button onClick={() => setAttendancePage(p => Math.min(totalAttendancePages, p + 1))} disabled={attendancePage === totalAttendancePages || totalAttendancePages === 0} className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-primary text-secondary hover:bg-primary/90 transition-all duration-300 disabled:opacity-30 active:scale-95 shadow-sm">Selanjutnya</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* â•â•â• TAB 2: CUTI / IZIN â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
            {activeTab === 'leave' && (
                <div className="bg-white rounded-[2rem] md:rounded-[1rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                    <div className="p-4 md:p-8 border-b border-primary/5 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 bg-secondary/10">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                            <input type="text" placeholder="Cari data pengajuan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" />
                        </div>
                    </div>

                    {isLoading ? (
                        <TableSkeleton rows={itemsPerPage} columns={canApproveLeave ? 6 : 5} />
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5 bg-gray-50/30">
                                    <th className="px-4 py-3 text-primary/80">Karyawan</th>
                                    <th className="px-4 py-3 text-primary/80">Jenis Pengajuan</th>
                                    <th className="px-4 py-3 text-primary/80">Durasi Tanggal</th>
                                    <th className="px-4 py-3 text-primary/80">Alasan</th>
                                    <th className="px-4 py-3 text-primary/80">Status</th>
                                    {canApproveLeave && <th className="px-4 py-3 text-center text-primary/80">Aksi</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {currentLeave.map((req) => (
                                    <tr key={req.id} onClick={() => { setSelectedLeaveRequest(req); setIsApprovalModalOpen(true); }} className="border-b border-primary/5 last:border-0 hover:bg-secondary/5 transition-colors cursor-pointer">
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center text-xs font-medium text-primary shadow-sm border border-primary/5">
                                                    {req.staffName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-primary tracking-tight">{req.staffName}</p>
                                                    <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest mt-0.5">{req.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2"><span className="text-sm font-medium text-primary/80">{req.type}</span></td>
                                        <td className="px-4 py-2">
                                            <p className="text-sm font-medium text-primary/80 mb-0.5"><span className="text-xs text-primary/40 mr-1 font-normal">Mulai:</span>{req.startDate}</p>
                                            <p className="text-sm font-medium text-primary/80"><span className="text-xs text-primary/40 mr-1 font-normal">Slsai:</span>{req.endDate}</p>
                                        </td>
                                        <td className="px-4 py-2 max-w-[200px]"><p className="text-sm font-medium text-primary/80 truncate">{req.reason}</p></td>
                                        <td className="px-4 py-2">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border border-white/50 ${req.status === 'Disetujui' ? 'bg-green-50 text-green-700 border-green-100' : req.status === 'Ditolak' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                                {req.status === 'Disetujui' ? <CheckCircle2 className="w-3 h-3" /> : req.status === 'Ditolak' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {req.status}
                                            </span>
                                        </td>
                                        {canApproveLeave && (
                                            <td className="px-4 py-2 text-center">
                                                <button onClick={(e) => { e.stopPropagation(); setSelectedLeaveRequest(req); setIsApprovalModalOpen(true); }} className="p-2 rounded-xl text-primary/40 hover:bg-white hover:text-primary transition-all shadow-sm active:scale-90">
                                                    <Edit3 className="w-4 h-4 mx-auto" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-primary/5">
                        {currentLeave.map((req) => (
                            <div key={req.id} onClick={() => { setSelectedLeaveRequest(req); setIsApprovalModalOpen(true); }} className="p-6 space-y-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-[11px] font-black text-primary border border-primary/5">{req.staffName.split(' ').map(n => n[0]).join('')}</div>
                                        <div>
                                            <p className="text-sm font-black text-primary tracking-tight">{req.staffName}</p>
                                            <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">{req.role}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${req.status === 'Disetujui' ? 'bg-green-100 text-green-700' : req.status === 'Ditolak' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {req.status}
                                    </span>
                                </div>
                                <div className="bg-gray-50/50 p-4 rounded-2xl border border-primary/5 space-y-2">
                                    <div className="flex justify-between"><span className="text-[9px] font-black text-primary/30 uppercase tracking-widest">Jenis</span><span className="text-[10px] font-black text-primary/60">{req.type}</span></div>
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-primary/5">
                                        <div><p className="text-[8px] font-black text-primary/30 uppercase tracking-widest">Mulai</p><p className="text-[10px] font-bold text-primary">{req.startDate}</p></div>
                                        <div><p className="text-[8px] font-black text-primary/30 uppercase tracking-widest">Selesai</p><p className="text-[10px] font-bold text-primary">{req.endDate}</p></div>
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold text-primary/60 line-clamp-2 px-1">{req.reason}</p>
                            </div>
                        ))}
                        {filteredLeave.length === 0 && (
                            <div className="p-12 text-center text-primary/20 font-black uppercase text-[10px] tracking-widest">Tidak ada data pengajuan</div>
                        )}
                    </div>
                        </>
                    )}

                    {/* Pagination */}
                    <div className="p-6 md:p-8 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40 bg-primary/5">
                        <span>Menampilkan {filteredLeave.length === 0 ? 0 : idxFirstLeave + 1} hingga {Math.min(idxLastLeave, filteredLeave.length)} dari {filteredLeave.length} data</span>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button onClick={() => setLeavePage(p => Math.max(1, p - 1))} disabled={leavePage === 1} className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-primary/10 bg-white hover:bg-gray-50 text-primary transition-all duration-300 disabled:opacity-30 active:scale-95 shadow-sm">Sebelumnya</button>
                            <button onClick={() => setLeavePage(p => Math.min(totalLeavePages, p + 1))} disabled={leavePage === totalLeavePages || totalLeavePages === 0} className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-primary text-secondary hover:bg-primary/90 transition-all duration-300 disabled:opacity-30 active:scale-95 shadow-sm">Selanjutnya</button>
                        </div>
                    </div>
                </div>
            )}

            {/* â•â•â• TAB 3: PENGAJUAN LEMBUR â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
            {activeTab === 'overtime' && canAccessReports && (
                <div className="space-y-6">
                    {/* Summary Banner */}
                    {pendingOvertimeCount > 0 && (
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 animate-fade-in">
                            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-amber-700">
                                    {pendingOvertimeCount} Pengajuan Menunggu Review
                                </p>
                                <p className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest">
                                    Segera tinjau dan berikan keputusan
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-[2rem] md:rounded-[1rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                        {/* Search */}
                        <div className="p-4 md:p-8 border-b border-primary/5 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 bg-primary/5">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                                <input type="text" placeholder="Cari nama, divisi, atau jenis pengajuan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all" />
                            </div>
                        </div>

                        {/* Desktop Table */}
                        {isLoading ? (
                            <TableSkeleton rows={itemsPerPage} columns={canApproveLeave ? 7 : 6} />
                        ) : (
                            <>
                                <div className="hidden md:block overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5 bg-gray-50/30">
                                        <th className="px-4 py-3 text-primary/80">Karyawan</th>
                                        <th className="px-4 py-3 text-primary/80">Jenis</th>
                                        <th className="px-4 py-3 text-primary/80">Shift / Jam</th>
                                        <th className="px-4 py-3 text-primary/80">Keterangan</th>
                                        <th className="px-4 py-3 text-primary/80">Tanggal</th>
                                        <th className="px-4 py-3 text-center text-primary/80">Status</th>
                                        {canApproveLeave && <th className="px-4 py-3 text-center text-primary/80">Aksi</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5">
                                    {currentOvertime.map((req) => {
                                        const shiftInfo = getActiveShift(req.shift, isRamadhan);
                                        return (
                                            <tr key={req.id} onClick={() => { setSelectedOvertimeReq(req); setIsOvertimeApprovalOpen(true); }} className="border-b border-primary/5 last:border-0 hover:bg-secondary/5 transition-colors cursor-pointer">
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center text-xs font-medium text-primary shadow-sm border border-primary/5 shrink-0">
                                                            {req.staffName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-primary tracking-tight">{req.staffName}</p>
                                                            <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest mt-0.5">{req.role}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="flex flex-col gap-1">
                                                        {(req.anomalyTypes || [req.primaryType]).map(t => (
                                                            <span key={t} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getOvertimeTypeStyle(t)}`}>
                                                                {t === 'Luar Kantor' ? <MapPin className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <p className="text-[10px] font-black text-primary/50">{shiftInfo?.label}</p>
                                                    <p className="text-[9px] text-primary/30 font-bold">Jadwal: {req.scheduledTime}</p>
                                                    <p className="text-[9px] text-primary/50 font-black">Aktual: {req.detectedTime}</p>
                                                </td>
                                                <td className="px-4 py-2 max-w-[220px]">
                                                    <p className="text-xs font-medium text-primary/70 line-clamp-2 italic">"{req.notes}"</p>
                                                </td>
                                                <td className="px-4 py-2 text-sm font-medium text-primary/60">{req.date}</td>
                                                <td className="px-4 py-2 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/50 ${getOvertimeStatusStyle(req.status)}`}>
                                                        {req.status === 'Disetujui' ? <CheckCircle2 className="w-3 h-3" /> : req.status === 'Ditolak' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                        {req.status}
                                                    </span>
                                                </td>
                                                {canApproveLeave && (
                                                    <td className="px-4 py-2 text-center">
                                                        <button onClick={(e) => { e.stopPropagation(); setSelectedOvertimeReq(req); setIsOvertimeApprovalOpen(true); }} className="p-2 rounded-xl text-primary/40 hover:bg-white hover:text-primary transition-all shadow-sm active:scale-90">
                                                            <Edit3 className="w-4 h-4 mx-auto" />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                    {filteredOvertime.length === 0 && (
                                        <tr>
                                            <td colSpan={canApproveLeave ? 7 : 6} className="px-4 py-16 text-center text-primary/20 font-black uppercase text-[10px] tracking-widest">
                                                Tidak ada pengajuan lembur
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-primary/5">
                            {currentOvertime.map((req) => {
                                const shiftInfo = getActiveShift(req.shift, isRamadhan);
                                return (
                                    <div key={req.id} onClick={() => { setSelectedOvertimeReq(req); setIsOvertimeApprovalOpen(true); }} className="p-6 space-y-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-[11px] font-black text-primary border border-primary/5">
                                                    {req.staffName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-primary tracking-tight">{req.staffName}</p>
                                                    <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">{req.role}</p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${getOvertimeStatusStyle(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(req.anomalyTypes || [req.primaryType]).map(t => (
                                                <span key={t} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getOvertimeTypeStyle(t)}`}>
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="bg-gray-50/50 p-4 rounded-2xl border border-primary/5 space-y-2">
                                            <div className="flex justify-between"><span className="text-[9px] font-black text-primary/30 uppercase tracking-widest">Shift</span><span className="text-[10px] font-black text-primary/60">{shiftInfo?.label}</span></div>
                                            <div className="flex justify-between"><span className="text-[9px] font-black text-primary/30 uppercase tracking-widest">Jadwal</span><span className="text-[10px] font-black text-primary/60">{req.scheduledTime}</span></div>
                                            <div className="flex justify-between"><span className="text-[9px] font-black text-primary/30 uppercase tracking-widest">Aktual</span><span className="text-[10px] font-black text-primary">{req.detectedTime}</span></div>
                                        </div>
                                        <p className="text-[10px] font-medium text-primary/60 italic line-clamp-2 px-1">"{req.notes}"</p>
                                        <div className="flex justify-between items-center text-[10px] font-bold text-primary/30 px-1">
                                            <span>{req.date}</span>
                                            <div className="flex items-center gap-1"><span>Detail</span><ChevronRight className="w-3 h-3" /></div>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredOvertime.length === 0 && (
                                <div className="p-12 text-center text-primary/20 font-black uppercase text-[10px] tracking-widest">Tidak ada pengajuan lembur</div>
                            )}
                        </div>
                            </>
                        )}

                        {/* Pagination */}
                        <div className="p-6 md:p-8 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40 bg-primary/5">
                            <span>Menampilkan {filteredOvertime.length === 0 ? 0 : idxFirstOvertime + 1} hingga {Math.min(idxLastOvertime, filteredOvertime.length)} dari {filteredOvertime.length} data</span>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button onClick={() => setOvertimePage(p => Math.max(1, p - 1))} disabled={overtimePage === 1} className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-primary/10 bg-white hover:bg-gray-50 text-primary transition-all duration-300 disabled:opacity-30 active:scale-95 shadow-sm">Sebelumnya</button>
                                <button onClick={() => setOvertimePage(p => Math.min(totalOvertimePages, p + 1))} disabled={overtimePage === totalOvertimePages || totalOvertimePages === 0} className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-primary text-secondary hover:bg-primary/90 transition-all duration-300 disabled:opacity-30 active:scale-95 shadow-sm">Selanjutnya</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendancePage;
