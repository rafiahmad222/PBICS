import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const Toast = () => {
    const { toast, hideToast } = useToast();
    const [shouldRender, setShouldRender] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);

    useEffect(() => {
        if (toast.isVisible) {
            setShouldRender(true);
            // Small delay to ensure the enter transition triggers
            const timer = setTimeout(() => setIsAnimating(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsAnimating(false);
            // Delay unmounting until transition completes (300ms matches duration-300)
            const timer = setTimeout(() => setShouldRender(false), 400);
            return () => clearTimeout(timer);
        }
    }, [toast.isVisible]);

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed top-6 right-6 z-50 transition-all duration-300 transform ${isAnimating
                ? 'translate-x-0 opacity-100'
                : 'translate-x-10 opacity-0'
                }`}
        >
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border-l-4 ${toast.type === 'success'
                ? 'bg-secondary-light border-primary shadow-primary/5'
                : 'bg-white border-red-500 shadow-red-500/5'
                }`}>
                <div className={`p-1.5 rounded-full ${toast.type === 'success' ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-500'
                    }`}>
                    {toast.type === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <XCircle className="w-5 h-5" />
                    )}
                </div>

                <div className="flex flex-col pr-2">
                    <p className={`text-xs font-bold uppercase tracking-wider ${toast.type === 'success' ? 'text-primary' : 'text-red-500'}`}>
                        {toast.type === 'success' ? 'Sukses' : 'Gagal'}
                    </p>
                    <p className="text-sm font-medium text-primary-dark opacity-90">{toast.message}</p>
                </div>

                <button
                    onClick={hideToast}
                    className="p-1 hover:bg-black/5 rounded-lg transition-colors ml-2 self-start mt-0.5"
                >
                    <X className="w-4 h-4 opacity-30 hover:opacity-60" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
