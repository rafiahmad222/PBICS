import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

const CustomMultiSelect = ({ label, values = [], onChange, options, placeholder = "Pilih beberapa...", icon: Icon, required, searchable = false, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const selectRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (optionValue) => {
        let newValues;
        if (values.includes(optionValue)) {
            newValues = values.filter(v => v !== optionValue);
        } else {
            newValues = [...values, optionValue];
        }
        onChange(newValues);
    };

    const removeValue = (e, optionValue) => {
        e.stopPropagation();
        onChange(values.filter(v => v !== optionValue));
    };

    const selectedOptions = options.filter(opt => values.includes(opt.value));

    return (
        <div ref={selectRef} className={`relative w-full ${className}`}>
            {label && <label className="block text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1 mb-2">{label}</label>}
            
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full min-h-[56px] flex flex-wrap items-center gap-2 p-3 pr-10 rounded-2xl border transition-all duration-300 shadow-sm outline-none cursor-pointer ${
                    isOpen 
                        ? 'border-primary ring-4 ring-primary/5 bg-white' 
                        : 'border-primary/5 bg-secondary/20 hover:border-primary/20 hover:bg-white'
                }`}
            >
                {Icon && <Icon className="w-5 h-5 text-primary/40 shrink-0 ml-1" />}
                
                {selectedOptions.length > 0 ? (
                    <div className="flex flex-wrap gap-2 flex-1">
                        {selectedOptions.map(opt => (
                            <span 
                                key={opt.value} 
                                className="flex items-center gap-1 bg-primary text-secondary px-2 py-1 rounded-lg text-xs font-bold"
                            >
                                {opt.label}
                                <button
                                    type="button"
                                    onClick={(e) => removeValue(e, opt.value)}
                                    className="p-0.5 hover:bg-white/20 rounded-md transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                ) : (
                    <span className="font-bold text-sm text-primary/40 flex-1 ml-1">{placeholder}</span>
                )}
                
                <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Menu */}
            <div 
                className={`absolute z-[100] w-full mt-2 bg-white border border-primary/5 rounded-[1.5rem] shadow-2xl shadow-primary/10 overflow-hidden transition-all duration-300 transform origin-top ${
                    isOpen 
                        ? 'opacity-100 scale-y-100 translate-y-0 visible' 
                        : 'opacity-0 scale-y-95 -translate-y-2 invisible'
                }`}
            >
                {/* Search Bar */}
                {searchable && (
                    <div className="p-3 border-b border-primary/5 bg-secondary/10">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                            <input
                                type="text"
                                placeholder="Cari..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-primary/5 text-xs font-bold text-primary placeholder:text-primary/30 focus:ring-2 focus:ring-primary/10 outline-none transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>
                    </div>
                )}

                <div className="max-h-[250px] overflow-y-auto scrollbar-hide py-2">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => {
                            const isSelected = values.includes(option.value);
                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleSelect(option.value);
                                    }}
                                    className={`w-full flex items-center justify-between px-5 py-3.5 text-left transition-all duration-200 hover:bg-primary/5 group ${
                                        isSelected ? 'bg-primary/5' : ''
                                    }`}
                                >
                                    <span className={`font-bold text-sm group-hover:text-primary transition-colors ${
                                        isSelected ? 'text-primary' : 'text-primary/60'
                                    }`}>
                                        {option.label}
                                    </span>
                                    {isSelected && (
                                        <Check className="w-5 h-5 text-primary animate-fade-in" />
                                    )}
                                </button>
                            );
                        })
                    ) : (
                        <div className="px-5 py-6 text-center text-xs font-bold text-primary/40 uppercase tracking-widest">
                            Tidak ada pilihan
                        </div>
                    )}
                </div>
            </div>

            {/* Hidden native input for required validation */}
            {required && values.length === 0 && (
                <input
                    type="text"
                    className="absolute opacity-0 h-0 w-0 bottom-0"
                    value=""
                    onChange={() => { }}
                    required={required}
                    onInvalid={(e) => e.target.setCustomValidity('Harap pilih minimal satu')}
                    onInput={(e) => e.target.setCustomValidity('')}
                />
            )}
        </div>
    );
};

export default CustomMultiSelect;
