import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Check } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Reusable Confirm Dialog - Redesigned to match image
   ───────────────────────────────────────────────────────────── */
const ConfirmModal = ({ config, onClose }) => {
    if (!config) return null;

    const {
        icon,          // 'delete' | 'save' | 'warning'
        header,
        message,
        acceptLabel,
        rejectLabel = 'BATAL',
        onAccept,
    } = config;

    const isDelete = icon === 'delete' || icon === 'warning';
    const isSave = icon === 'save';

    // Theme Colors based on design
    const headerBg = isDelete ? 'bg-[#C53030]' : 'bg-[#0D3B28]';
    const actionBtnBg = isDelete ? 'bg-[#C53030] hover:bg-[#A62828]' : 'bg-[#0D3B28] hover:bg-[#0A2E1F]';
    
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Card */}
            <div
                className="relative w-full max-w-[340px] bg-white rounded-[2rem] overflow-hidden shadow-2xl text-center flex flex-col"
                style={{ animation: 'confirmPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
            >
                {/* Header Section (Colored) */}
                <div className={`${headerBg} py-7 flex items-center justify-center transition-colors duration-300`}>
                    <div className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                        {isDelete ? (
                            <AlertTriangle className="w-8 h-8 text-white" />
                        ) : (
                            <Check className="w-8 h-8 text-white stroke-[3px]" />
                        )}
                    </div>
                </div>

                {/* Content Section (White) */}
                <div className="p-7 pt-5">
                    {/* Header Text */}
                    <h3 className="text-[20px] font-bold text-[#0D3B28] tracking-tight mb-1.5">
                        {header}
                    </h3>

                    {/* Message Text */}
                    <p className="text-[14px] text-[#6B7280] font-medium mb-7 px-2 leading-relaxed">
                        {message}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3.5">
                        {/* Cancel Button */}
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-2xl bg-[#F3F4F6] text-[#111827] font-bold text-xs uppercase tracking-wider hover:bg-[#E5E7EB] transition-all active:scale-[0.97]"
                        >
                            {rejectLabel}
                        </button>
                        
                        {/* Accept Button */}
                        <button
                            onClick={() => { onAccept(); onClose(); }}
                            className={`flex-1 py-3 rounded-2xl ${actionBtnBg} text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.97] shadow-lg shadow-black/5`}
                        >
                            {acceptLabel}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes confirmPop {
                    from { opacity: 0; transform: scale(0.92) translateY(20px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.25s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>,
        document.body
    );
};

export default ConfirmModal;
