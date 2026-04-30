import React, { createContext, useContext, useRef, useCallback } from 'react';
import { Toast } from 'primereact/toast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const toastRef = useRef(null);

    const showToast = useCallback((message, type = 'success') => {
        const severityMap = {
            success: 'success',
            error: 'error',
            warning: 'warn',
            info: 'info',
        };

        const summaryMap = {
            success: 'Berhasil',
            error: 'Gagal',
            warning: 'Perhatian',
            info: 'Informasi',
        };

        toastRef.current?.show({
            severity: severityMap[type] || 'success',
            summary: summaryMap[type] || 'Berhasil',
            detail: message,
            life: 3500,
        });
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            <Toast ref={toastRef} position="top-right" />
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};
