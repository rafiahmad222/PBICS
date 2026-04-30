import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, X, CheckCircle2, AlertCircle, Loader2, MapPin } from 'lucide-react';
import { getActiveShift, checkIsLate, checkIsOvertime } from '../../utils/shiftConfig';

const FaceScanModal = ({ isOpen, onClose, onScanSuccess, type, employeeShift, isRamadhan = false }) => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [scanStatus, setScanStatus] = useState('initializing'); // initializing, scanning, success, error
    const [progress, setProgress] = useState(0);
    const [locationStatus, setLocationStatus] = useState('unknown'); // unknown, inside, outside

    useEffect(() => {
        if (isOpen) {
            setScanStatus('initializing');
            setProgress(0);
            startCamera();
        } else {
            stopCamera();
        }

        return () => stopCamera();
    }, [isOpen]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        // Simulasi: koordinat kantor (lat, lng)
                        // Di produksi, ganti dengan koordinat kantor yang sesungguhnya
                        const OFFICE_LAT = -8.1702;
                        const OFFICE_LNG = 113.7120;
                        const RADIUS_METERS = 500;

                        const R = 6371000; // radius bumi dalam meter
                        const dLat = (pos.coords.latitude - OFFICE_LAT) * Math.PI / 180;
                        const dLng = (pos.coords.longitude - OFFICE_LNG) * Math.PI / 180;
                        const a = Math.sin(dLat/2) ** 2 +
                            Math.cos(OFFICE_LAT * Math.PI / 180) *
                            Math.cos(pos.coords.latitude * Math.PI / 180) *
                            Math.sin(dLng/2) ** 2;
                        const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

                        setLocationStatus(distance <= RADIUS_METERS ? 'inside' : 'outside');
                        setScanStatus('ready');
                    },
                    () => {
                        setLocationStatus('unknown');
                        setScanStatus('ready');
                    }
                );
            } else {
                setLocationStatus('unknown');
                setScanStatus('ready');
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setScanStatus('error');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const startScanningSimulation = () => {
        setScanStatus('scanning');
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += Math.random() * 15;
            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(interval);
                handleScanSuccess();
            }
            setProgress(currentProgress);
        }, 300);
    };

    const handleScanSuccess = () => {
        setScanStatus('success');
        const mockPhoto = `https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop`;

        // ── Deteksi Anomali ──────────────────────────────────────────────
        const now = new Date();
        const detectedTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const shift = employeeShift ? getActiveShift(employeeShift, isRamadhan) : null;

        let isLate = false, isOvertime = false, diffMinutes = 0;
        if (shift) {
            if (type === 'in') {
                const result = checkIsLate(detectedTime, shift.checkIn);
                isLate = result.isLate;
                diffMinutes = result.diffMinutes;
            } else {
                const result = checkIsOvertime(detectedTime, shift.checkOut, shift.overnight);
                isOvertime = result.isOvertime;
                diffMinutes = result.diffMinutes;
            }
        }
        const isOutside = locationStatus === 'outside';

        const anomalyInfo = { isLate, isOvertime, isOutside, detectedTime, shift, diffMinutes, scheduledTime: type === 'in' ? shift?.checkIn : shift?.checkOut };
        // ────────────────────────────────────────────────────────────────

        setTimeout(() => {
            onScanSuccess(mockPhoto, anomalyInfo);
            onClose();
        }, 1500);
    };

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30"
            onClick={onClose}
        >
            {/* Modal Content */}
            <div 
                className="relative w-full max-w-md bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 md:p-6 border-b border-primary/5 flex justify-between items-center bg-secondary/10 shrink-0">
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-primary tracking-tighter leading-none">
                            Face Scan Attendance
                        </h3>
                        <p className="text-[9px] md:text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] mt-2">
                            {type === 'in' ? 'Check-in Verification' : 'Check-out Verification'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 md:p-3 rounded-2xl bg-white border border-primary/5 text-primary/30 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Camera View */}
                <div className="p-5 md:p-8 flex-1 overflow-y-auto scrollbar-hide">
                    <div className="relative aspect-[3/4] sm:aspect-[4/5] mx-auto w-full max-w-sm rounded-[1.5rem] md:rounded-[2rem] bg-secondary/20 border-4 border-primary/5 overflow-hidden group shadow-inner">
                        {/* Video Feed */}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover scale-x-[-1]"
                        />

                        {/* Scanning Overlays */}
                        {(scanStatus === 'scanning' || scanStatus === 'ready') && (
                            <>
                                <div className="absolute inset-0 border-[16px] sm:border-[24px] border-black/20" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-40 h-40 sm:w-56 sm:h-56 border-2 border-primary/40 rounded-full animate-pulse shadow-[0_0_30px_rgba(27,77,62,0.2)]" />
                                </div>
                                {/* Scanning Line */}
                                <div className="absolute left-1/2 -translate-x-1/2 w-48 sm:w-64 h-0.5 bg-primary/60 shadow-[0_0_15px_rgba(27,77,62,0.6)] animate-[scan_3s_ease-in-out_infinite]" />

                                {/* UI Decorations */}
                                <div className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-[8px] md:text-[10px] font-black text-white px-2 py-1 bg-black/40 rounded-md uppercase tracking-widest backdrop-blur-sm">REC LIVE</span>
                                </div>
                                {scanStatus === 'scanning' && (
                                    <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6">
                                        <span className="text-[8px] md:text-[10px] font-black text-white px-2.5 py-1.5 bg-primary/60 rounded-full uppercase tracking-widest backdrop-blur-md">Scanning...</span>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Success Overlay */}
                        {scanStatus === 'success' && (
                            <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm flex flex-col items-center justify-center text-secondary animate-fade-in p-6 text-center">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-secondary rounded-full flex items-center justify-center shadow-xl mb-4">
                                    <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                                </div>
                                <h4 className="text-lg md:text-xl font-black tracking-tight">Access Granted</h4>
                                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-2">{type === 'in' ? 'Logged In Successfully' : 'Logged Out Successfully'}</p>
                            </div>
                        )}

                        {/* Error Overlay */}
                        {scanStatus === 'error' && (
                            <div className="absolute inset-0 bg-red-500/90 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-fade-in p-6 text-center">
                                <AlertCircle className="w-12 h-12 md:w-16 md:h-16 mb-4" />
                                <h4 className="text-lg md:text-xl font-black">Scanning Failed</h4>
                                <p className="px-4 mt-2 text-xs md:text-sm font-medium opacity-80">Could not access camera. Please check permissions.</p>
                                <button
                                    onClick={startCamera}
                                    className="mt-6 px-6 py-2.5 bg-white text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                                >
                                    Retry Access
                                </button>
                            </div>
                        )}

                        {/* Initializing Overlay */}
                        {scanStatus === 'initializing' && (
                            <div className="absolute inset-0 bg-secondary flex flex-col items-center justify-center text-primary/40">
                                <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin mb-4" />
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Initializing...</span>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar & Actions */}
                    <div className="mt-6 md:mt-8 space-y-3">
                        {scanStatus === 'ready' ? (
                            <button
                                onClick={startScanningSimulation}
                                className="w-full flex justify-center items-center py-4 bg-primary text-secondary rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                Ambil Gambar & Lokasi
                            </button>
                        ) : (
                            <>
                                <div className="flex justify-between items-center text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary/40 px-1">
                                    <span>Recognition Progress</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="h-1.5 md:h-2 w-full bg-secondary/40 rounded-full overflow-hidden p-0.5 border border-primary/5">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(27,77,62,0.3)]"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer Message */}
                <div className="p-4 bg-secondary/5 border-t border-primary/5 flex items-center justify-center gap-2 text-[8px] md:text-[9px] font-black text-primary/20 uppercase tracking-[0.2em] text-center shrink-0">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>
                        Lokasi: {locationStatus === 'inside' ? '✓ Dalam Kantor' : locationStatus === 'outside' ? '⚠ Luar Kantor' : 'Mendeteksi...'}
                    </span>
                </div>
            </div>

            {/* Global Keyframes for the scan line */}
            <style>{`
                @keyframes scan {
                    0% { top: 10%; }
                    50% { top: 85%; }
                    100% { top: 10%; }
                }
            `}</style>
        </div>
    , document.body);
};

export default FaceScanModal;
