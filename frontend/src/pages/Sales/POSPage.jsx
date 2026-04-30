import React, { useState, useMemo } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, CheckCircle2, Package, ArrowLeft, Filter, Tag, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import TableSkeleton from '../../components/UI/TableSkeleton';

const POSPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [cart, setCart] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('Tunai');
    const [isProcessing, setIsProcessing] = useState(false);

    // Simulate loading
    React.useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    // Identitas Pelanggan & Promo
    const [isMember, setIsMember] = useState(false);
    const [promoInput, setPromoInput] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [isPromoDropdownOpen, setIsPromoDropdownOpen] = useState(false);

    const SYSTEM_PROMOS = [
        { code: 'RAMADHAN50', name: 'Diskon Spesial Ramadhan', type: 'Persen', value: 10, startDate: '2026-03-01', endDate: '2026-04-30', status: 'Aktif' },
        { code: 'NEWGLOW', name: 'Potongan Treatment Glow Up', type: 'Nominal', value: 150000, startDate: '2026-03-15', endDate: '2026-04-15', status: 'Aktif' },
        { code: 'VALENTINE20', name: 'Kasih Sayang Diskon', type: 'Persen', value: 20, startDate: '2026-02-10', endDate: '2026-02-20', status: 'Berakhir' },
        { code: 'MEMBERBARU', name: 'Welcome New Member', type: 'Nominal', value: 50000, startDate: '2026-01-01', endDate: '2026-12-31', status: 'Aktif' },
        { code: 'CANTIK100', name: 'Potongan Facial 100k', type: 'Nominal', value: 100000, startDate: '2026-03-10', endDate: '2026-05-10', status: 'Aktif' },
    ];

    const getActivePromos = () => {
        const today = new Date().toISOString().split('T')[0];
        return SYSTEM_PROMOS.filter(p => p.status === 'Aktif' && today >= p.startDate && today <= p.endDate);
    };

    // Customer Selection State
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

    const categories = ['Semua', 'Obat', 'Treatment', 'Skincare'];

    const customers = [
        { id: 'PAS-001', name: 'Siti Aminah', phone: '0812-3456-7890' },
        { id: 'PAS-002', name: 'Budi Santoso', phone: '0813-9876-5432' },
        { id: 'PAS-003', name: 'Dewi Lestari', phone: '0811-5555-4444' },
        { id: 'PAS-004', name: 'Ahmad Fauzi', phone: '0819-2222-3333' },
        { id: 'PAS-005', name: 'Rina Wijaya', phone: '0812-8888-9999' },
    ];

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.id.toLowerCase().includes(customerSearch.toLowerCase())
    );

    const products = [
        { id: 'PRD-001', name: 'Acne Treatment Pack', category: 'Skincare', price: 450000, stock: 15, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-002', name: 'Laser Therapy Session', category: 'Treatment', price: 1200000, stock: 5, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-003', name: 'Chemical Peel', category: 'Treatment', price: 350000, stock: 8, image: 'https://images.unsplash.com/photo-1570172619991-8079603683a3?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-004', name: 'Skin Glow Kit', category: 'Skincare', price: 850000, stock: 12, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-005', name: 'Sunscreen SPF 50', category: 'Skincare', price: 150000, stock: 25, image: 'https://images.unsplash.com/photo-1598440499033-547b19615c0a?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-006', name: 'Paracetamol 500mg', category: 'Obat', price: 15000, stock: 100, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-007', name: 'Night Cream Retinol', category: 'Skincare', price: 250000, stock: 10, image: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-008', name: 'Amoxicillin Syrup', category: 'Obat', price: 45000, stock: 20, image: 'https://images.unsplash.com/photo-1471864190281-ad5f9f30d947?q=80&w=200&h=200&auto=format&fit=crop' },
    ];

    const filteredProducts = products.filter(p =>
        (activeCategory === 'Semua' || p.category === activeCategory) &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item =>
            item.id === id
                ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                : item
        ));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const cartTotal = useMemo(() =>
        cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    , [cart]);

    // Kalkulasi Harga Akhir
    const memberDiscount = isMember ? (cartTotal * 0.05) : 0;
    
    const calculatePromoDiscount = () => {
        if (!appliedPromo) return 0;
        if (appliedPromo.type === 'Persen') {
            return (cartTotal - memberDiscount) * (appliedPromo.value / 100);
        }
        return appliedPromo.value;
    };
    const promoDiscount = calculatePromoDiscount();

    const tax = Math.max(0, (cartTotal - memberDiscount - promoDiscount) * 0.11);
    const finalTotal = Math.max(0, (cartTotal - memberDiscount - promoDiscount) + tax);

    const handleApplyPromo = (codeToApply = promoInput) => {
        if (!codeToApply.trim()) {
            setAppliedPromo(null);
            return;
        }
        
        const validPromos = getActivePromos();
        const found = validPromos.find(p => p.code.toUpperCase() === codeToApply.toUpperCase());
        
        if (found) {
            setAppliedPromo(found);
            setPromoInput(found.code);
            showToast('Promo berhasil diterapkan!', 'success');
        } else {
            showToast('Kode promo tidak valid atau belum aktif/sudah kadaluarsa', 'error');
            setAppliedPromo(null);
        }
        setIsPromoDropdownOpen(false);
    };

    const handleCheckout = () => {
        if (cart.length === 0) {
            showToast('Keranjang masih kosong!', 'error');
            return;
        }
        if (!selectedCustomer) {
            showToast('Pilih customer terlebih dahulu!', 'error');
            return;
        }
        setIsProcessing(true);

        setTimeout(() => {
            showToast('Transaksi Berhasil Disimpan!', 'success');
            setCart([]);
            setSelectedCustomer(null);
            setIsProcessing(false);
            navigate('/sales');
        }, 1500);
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-90px)] lg:h-[calc(100vh-90px)] gap-6 animate-fade-in relative z-10 pb-24 lg:pb-0">
            {/* Left Side: Stok Selection */}
            <div className="flex-1 flex flex-col bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/10 shadow-2xl shadow-primary/5 overflow-hidden min-h-0">
                <div className="p-5 md:p-8 bg-secondary/10 border-b border-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            onClick={() => navigate('/sales')}
                            className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-white text-primary/40 hover:text-primary transition-all shadow-sm hover:scale-105 active:scale-95 border border-primary/5"
                        >
                            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-primary tracking-tighter">Sistem Kasir</h2>
                            <p className="hidden sm:block text-[9px] md:text-[10px] font-bold text-primary/60 uppercase tracking-widest mt-1">Pilih Stok atau Layanan</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 md:space-y-8 scrollbar-hide">
                    {/* Search & Categories */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Cari nama stok..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-3.5 md:py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-bold focus:ring-4 focus:ring-primary/5 transition-all text-xs md:text-sm shadow-sm"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-primary text-secondary shadow-lg shadow-primary/20 scale-105' : 'bg-white border border-primary/5 text-primary/40 hover:bg-secondary/50 hover:text-primary'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isLoading ? (
                        <TableSkeleton mode="card" rows={8} />
                    ) : (
                        /* Product Grid */
                        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {filteredProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="p-4 rounded-[2rem] bg-white border border-primary/5 hover:bg-secondary/10 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-500 text-left group flex flex-col justify-between h-full"
                            >
                                <div>
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-secondary/20 overflow-hidden mb-4 shadow-sm relative mx-auto">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                        <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-white/90 backdrop-blur-sm border border-primary/5 text-[6px] md:text-[7px] font-black text-primary uppercase tracking-tighter">
                                            {product.stock}
                                        </div>
                                    </div>
                                    <h4 className="text-[10px] md:text-[11px] font-black text-primary leading-tight mb-1 line-clamp-2 text-center">{product.name}</h4>
                                    <p className="text-[8px] md:text-[9px] font-bold text-primary/30 uppercase tracking-widest mb-3 text-center">{product.category}</p>
                                </div>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-primary/5">
                                    <span className="text-xs md:text-sm font-black text-primary tracking-tighter">Rp {product.price.toLocaleString('id-ID')}</span>
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-primary flex items-center justify-center text-secondary group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                                        <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    )}
                </div>
            </div>

            {/* Right Side: Unified Cart & Summary */}
            <div className="w-full lg:w-[420px] bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/10 shadow-2xl shadow-primary/5 flex flex-col overflow-hidden h-fit lg:h-full">

                {/* 1. Header & Customer Selection */}
                <div className="p-4 md:p-5 bg-secondary/10 border-b border-primary/5">
                    <div className="flex items-center gap-3 mb-5 md:mb-6">
                        <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary relative">
                            <ShoppingCart className="w-5 h-5" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-gold text-primary text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                    {cart.reduce((a, b) => a + b.quantity, 0)}
                                </span>
                            )}
                        </div>
                        <h3 className="text-lg md:text-xl font-black text-primary tracking-tighter">Ringkasan Pesanan</h3>
                    </div>

                    <div className="relative">
                        {selectedCustomer ? (
                            <div className="p-3.5 md:p-4 rounded-xl md:rounded-2xl bg-white border border-primary/10 flex flex-col animate-fade-in shadow-sm">
                                <div className="flex justify-between items-center bg-white">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-secondary text-[10px] font-black text-primary flex items-center justify-center border border-primary/5">
                                            {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-[10px] md:text-[11px] font-black text-primary">{selectedCustomer.name}</p>
                                            <p className="text-[8px] md:text-[9px] font-bold text-primary/30 uppercase tracking-tighter">{selectedCustomer.id}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedCustomer(null);
                                            setIsMember(false);
                                        }}
                                        className="px-3 py-1.5 rounded-lg text-primary/30 hover:text-red-500 hover:bg-red-50 transition-all font-black text-[8px] md:text-[9px] uppercase tracking-widest border border-transparent hover:border-red-100"
                                    >
                                        UBAH
                                    </button>
                                </div>
                                <div className="border-t border-primary/5 mt-3 pt-3 flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-primary/60">Tandai sebagai Member? (Diskon 5%)</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={isMember} onChange={e => setIsMember(e.target.checked)} />
                                        <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-accent-gold"></div>
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/30 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Cari customer..."
                                    value={customerSearch}
                                    onChange={(e) => {
                                        setCustomerSearch(e.target.value);
                                        setIsCustomerDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsCustomerDropdownOpen(true)}
                                    className="w-full pl-11 pr-6 py-3 md:py-3.5 rounded-xl md:rounded-2xl bg-white border border-primary/10 outline-none text-[10px] md:text-[11px] font-bold text-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                                />
                                {isCustomerDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-primary/5 shadow-2xl z-50 overflow-hidden max-h-[160px] overflow-y-auto scrollbar-hide animate-fade-in">
                                        {filteredCustomers.length > 0 ? (
                                            filteredCustomers.map(customer => (
                                                <button
                                                    key={customer.id}
                                                    onClick={() => {
                                                        setSelectedCustomer(customer);
                                                        setIsCustomerDropdownOpen(false);
                                                        setCustomerSearch('');
                                                    }}
                                                    className="w-full p-3 md:p-3.5 text-left hover:bg-secondary/20 transition-all border-b border-primary/5 last:border-0 group"
                                                >
                                                    <p className="text-[10px] md:text-[11px] font-black text-primary group-hover:translate-x-1 transition-transform">{customer.name}</p>
                                                    <p className="text-[8px] md:text-[9px] font-bold text-primary/30 mt-0.5 uppercase tracking-tighter">{customer.id} • {customer.phone}</p>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-primary/30 text-[9px] font-black uppercase tracking-widest">
                                                Tidak ditemukan
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Cart Items (Scrollable Area) */}
                <div className="flex-1 overflow-y-auto min-h-[100px] p-4 md:p-5 space-y-3 scrollbar-hide bg-white shadow-inner">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-[8px] md:text-[9px] font-black text-primary/30 uppercase tracking-[0.2em]">Daftar Item ({cart.length})</p>
                        {cart.length > 0 && (
                            <button
                                onClick={() => setCart([])}
                                className="text-[8px] font-black text-primary/30 hover:text-red-500 uppercase tracking-widest transition-all"
                            >
                                Hapus
                            </button>
                        )}
                    </div>
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-12">
                            <Package className="w-12 h-12 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Keranjang Kosong</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="p-2.5 md:p-3 rounded-2xl bg-secondary/5 border border-primary/5 shadow-sm animate-fade-in flex flex-col gap-1.5 group">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-[10px] md:text-[11px] font-black text-primary tracking-tight leading-tight uppercase flex-1">{item.name}</h4>
                                    <button onClick={() => removeFromCart(item.id)} className="p-1 text-primary/20 hover:text-red-500 transition-all ml-2">
                                        <Trash2 className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                    </button>
                                </div>
                                    <div className="flex justify-between items-center mt-1.5 md:mt-2">
                                        <div className="flex items-center gap-2 md:gap-2.5 bg-white rounded-lg px-2 py-0.5 shadow-sm border border-primary/5">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="p-0.5 hover:bg-secondary rounded transition-all text-primary/30 hover:text-primary"><Minus className="w-2 md:w-2.5 h-2 md:h-2.5" /></button>
                                            <span className="text-[9px] md:text-[10px] font-black text-primary min-w-[15px] text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="p-0.5 hover:bg-secondary rounded transition-all text-primary/30 hover:text-primary"><Plus className="w-2 md:w-2.5 h-2 md:h-2.5" /></button>
                                        </div>
                                        <span className="text-[10px] md:text-[11px] font-black text-primary tracking-tighter">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
                {/* 3. Checkout Section (Fixed at bottom) */}
                <div className="p-3 md:p-4 bg-white border-t border-primary/5 space-y-2 md:space-y-3 shrink-0">
                    
                    {/* Promo Input */}
                    <div className="flex gap-2 relative">
                        <div className="relative flex-1">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                            <input
                                type="text"
                                placeholder="Kode Promo..."
                                value={promoInput}
                                onChange={(e) => {
                                    setPromoInput(e.target.value.toUpperCase());
                                    setIsPromoDropdownOpen(true);
                                }}
                                onFocus={() => setIsPromoDropdownOpen(true)}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-primary/10 outline-none text-primary font-bold focus:ring-2 focus:ring-primary/20 transition-all text-[10px] md:text-xs uppercase placeholder:normal-case placeholder:font-medium shadow-sm relative z-20"
                            />
                            {isPromoDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsPromoDropdownOpen(false)} />
                                    <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-primary/10 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[180px] overflow-y-auto animate-fade-in divide-y divide-primary/5">
                                        {getActivePromos().length === 0 ? (
                                            <div className="p-4 text-center text-[9px] font-black text-primary/30 uppercase tracking-widest">Tidak ada promo tersedia saat ini</div>
                                        ) : (
                                            getActivePromos().map(promo => (
                                                <button
                                                    key={promo.code}
                                                    onClick={() => handleApplyPromo(promo.code)}
                                                    className="w-full p-3 text-left hover:bg-secondary/20 transition-all group flex justify-between items-center"
                                                >
                                                    <div>
                                                        <div className="text-[10px] md:text-[11px] font-black text-primary group-hover:translate-x-1 transition-transform">{promo.code}</div>
                                                        <div className="text-[8px] md:text-[9px] font-bold text-primary/40 leading-tight mt-0.5">{promo.name}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[10px] font-black text-green-500">
                                                            {promo.type === 'Persen' ? `${promo.value}%` : `Rp ${promo.value.toLocaleString('id-ID')}`}
                                                        </div>
                                                        <div className="text-[7px] font-black text-primary/30 uppercase tracking-widest leading-none mt-1">Hingga {promo.endDate}</div>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-2 pt-2 border-t border-primary/5">
                        <div className="flex justify-between text-primary/40 font-bold text-[8px] md:text-[9px] uppercase tracking-widest px-1">
                            <span>Subtotal</span>
                            <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                        </div>
                        {isMember && (
                            <div className="flex justify-between text-blue-500 font-bold text-[8px] md:text-[9px] uppercase tracking-widest px-1">
                                <span>Diskon Member (5%)</span>
                                <span>- Rp {memberDiscount.toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        {appliedPromo && (
                            <div className="flex justify-between text-green-500 font-bold text-[8px] md:text-[9px] uppercase tracking-widest px-1">
                                <span>Promo ({appliedPromo.code})</span>
                                <span>- Rp {promoDiscount.toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-primary/40 font-bold text-[8px] md:text-[9px] uppercase tracking-widest px-1">
                            <span>Pajak (11%)</span>
                            <span>Rp {tax.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 mt-1">
                            <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em]">Total</span>
                            <span className="text-xl md:text-2xl font-black text-primary tracking-tighter">Rp {finalTotal.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        <button
                            disabled={cart.length === 0 || isProcessing}
                            onClick={handleCheckout}
                            className={`w-full py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 relative overflow-hidden group ${cart.length === 0 ? 'bg-primary/5 text-primary/10 pointer-events-none' : 'bg-primary text-secondary hover:scale-[1.02] active:scale-95 shadow-primary/20 hover:shadow-primary/40'}`}
                        >
                            <div className="relative z-10 flex items-center justify-center gap-2 md:gap-3">
                                {isProcessing ? (
                                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                                        <span>Proses Transaksi</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POSPage;
