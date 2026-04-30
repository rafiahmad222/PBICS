import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const CustomDatePicker = ({
    label,
    value, // YYYY-MM-DD string
    onChange, // (value: string) => void
    placeholder = 'Pilih Tanggal',
    icon: Icon = CalendarIcon,
    required = false,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date(value || new Date()));
    const containerRef = useRef(null);

    // Initialize exactly on the current format
    const getFormattedDate = (date) => {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    };

    const getDisplayDate = () => {
        if (!value) return placeholder;
        const d = new Date(value);
        if (isNaN(d.getTime())) return placeholder;
        
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return d.toLocaleDateString('id-ID', options);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const handlePrevMonth = (e) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = (e) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateSelect = (day) => {
        if (!day) return;
        const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        onChange(getFormattedDate(selected));
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            {label && <label className="block text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1 mb-2">{label}</label>}
            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 shadow-sm outline-none bg-secondary/20 hover:bg-white text-left ${
                    isOpen 
                        ? 'border-primary ring-4 ring-primary/5 bg-white' 
                        : 'border-primary/5 hover:border-primary/20'
                }`}
            >
                <div className="flex items-center gap-3 w-full">
                    {Icon && <Icon className="w-5 h-5 text-primary/40 shrink-0" />}
                    <span className={`font-medium text-sm truncate ${value ? 'text-primary' : 'text-primary/40'}`}>
                        {getDisplayDate()}
                    </span>
                </div>
            </button>

            {/* Calendar Popup */}
            <div 
                className={`absolute z-[200] mt-2 top-full right-0 sm:left-0 sm:right-auto min-w-[220px] max-w-[240px] bg-white border border-primary/5 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden transition-all duration-300 transform origin-top ${
                    isOpen 
                        ? 'opacity-100 scale-y-100 translate-y-0 visible' 
                        : 'opacity-0 scale-y-95 -translate-y-2 invisible'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-2.5 border-b border-primary/5 bg-secondary/10">
                    <button 
                        type="button" 
                        onClick={handlePrevMonth}
                        className="p-1 rounded-lg text-primary/50 hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                        <ChevronLeft className="w-3 h-3" />
                    </button>
                    <span className="font-black text-[11px] text-primary tracking-tight">
                        {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </span>
                    <button 
                        type="button" 
                        onClick={handleNextMonth}
                        className="p-1 rounded-lg text-primary/50 hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 p-2 pb-1">
                    {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                        <div key={day} className="text-center text-[8px] font-black text-primary/30 uppercase tracking-widest">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Date Grid */}
                <div className="grid grid-cols-7 p-2 pt-0">
                    {days.map((day, index) => {
                        const dateString = day ? getFormattedDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day)) : null;
                        const isSelected = value === dateString;
                        const isToday = getFormattedDate(new Date()) === dateString;

                        if (!day) {
                            return <div key={`empty-${index}`} className="w-full h-7" />;
                        }

                        return (
                            <button
                                key={`day-${day}`}
                                type="button"
                                onClick={() => handleDateSelect(day)}
                                className={`w-full h-7 flex items-center justify-center rounded-md text-[10px] font-bold transition-all duration-200 ${
                                    isSelected 
                                        ? 'bg-primary text-secondary shadow-sm shadow-primary/20 scale-105' 
                                        : isToday
                                            ? 'bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10'
                                            : 'text-primary/70 hover:bg-secondary hover:text-primary'
                                }`}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Hidden native input for form validation validation */}
            {required && (
                <input
                    type="date"
                    className="absolute opacity-0 h-0 w-0 bottom-0"
                    value={value || ''}
                    onChange={() => { }}
                    required={required}
                    onInvalid={(e) => e.target.setCustomValidity('Harap pilih tanggal')}
                    onInput={(e) => e.target.setCustomValidity('')}
                />
            )}
        </div>
    );
};

export default CustomDatePicker;
