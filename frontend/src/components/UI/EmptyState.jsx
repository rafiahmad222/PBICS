import React from 'react';
import emptyData from '../../assets/illustrations/empty_data.png';
import emptyPatient from '../../assets/illustrations/empty_patient.png';
import emptySales from '../../assets/illustrations/empty_sales.png';
import emptyRecords from '../../assets/illustrations/empty_records.png';

/**
 * EmptyState Component
 * Displays a beautiful minimal linear illustration with a title and description
 * for when lists or data tables are empty.
 */
const EmptyState = ({ type = 'data', title, description, action }) => {
    const getIllustration = () => {
        switch (type) {
            case 'patient': return emptyPatient;
            case 'sales': return emptySales;
            case 'records': return emptyRecords;
            default: return emptyData;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in-up">
            <div className="relative mb-8 group">
                {/* Background pulse effect */}
                <div className="absolute inset-0 bg-primary/5 rounded-full scale-110 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <img 
                    src={getIllustration()} 
                    alt={title}
                    className="w-48 md:w-64 h-auto relative z-10 transition-transform duration-500 group-hover:scale-105"
                />
            </div>
            
            <h3 className="text-xl md:text-2xl font-black text-primary tracking-tighter mb-2">
                {title || 'Belum Ada Data'}
            </h3>
            
            <p className="text-sm text-primary/40 font-bold max-w-sm mb-8 leading-relaxed italic">
                {description || 'Sistem tidak menemukan informasi yang Anda cari saat ini. Silakan coba filter lain atau mulai dengan data baru.'}
            </p>

            {action && (
                <div className="transition-all hover:scale-105 active:scale-95">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
