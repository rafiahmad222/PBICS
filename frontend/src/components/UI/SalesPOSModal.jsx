import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, CheckCircle2, Package, Star, Filter } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const SalesPOSModal = ({ isOpen, onClose, onTransactionSuccess }) => {
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('Tunai');
    const [isProcessing, setIsProcessing] = useState(false);

    const categories = ['Semua', 'Obat', 'Treatment', 'Skincare'];

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

    const handleCheckout = () => {
        if (cart.length === 0) return;
        setIsProcessing(true);

        // Simulate transaction process
        setTimeout(() => {
            const transaction = {
                id: `INV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                customer: 'Walk-in Customer',
                product: cart.length > 1 ? `${cart[0].name} & ${cart.length - 1} lainnya` : cart[0].name,
                amount: `Rp ${cartTotal.toLocaleString('id-ID')}`,
                status: 'Selesai',
                date: new Date().toISOString().split('T')[0]
            };

            onTransactionSuccess(transaction);
            showToast('Transaksi Berhasil Disimpan!', 'success');
            setCart([]);
            setIsProcessing(false);
            onClose();
        }, 1500);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-black/30 animate-fade-in" onClick={onClose}>
            <div className="relative w-full h-full md:h-auto md:max-w-6xl md:rounded-[3.5rem] bg-white shadow-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in-up border border-primary/5" onClick={(e) => e.stopPropagation()}>


                {/* Left Side: Product Selection */}
                <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-primary/5">
                    <div className="p-8 bg-secondary/10 flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-black text-primary tracking-tighter">Katalog POS</h3>
                            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mt-1">Pilih Stok atau Layanan</p>
                        </div>
                        <button onClick={onClose} className="md:hidden p-3 rounded-2xl hover:bg-secondary transition-all">
                            <X className="w-6 h-6 text-primary" />
                        </button>
                    </div>

                    <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto scrollbar-hide">
                        {/* Search & Categories */}
                        <div className="space-y-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Cari stok..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-bold focus:ring-4 focus:ring-primary/5 transition-all text-sm"
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-primary text-secondary shadow-lg' : 'bg-white border border-primary/10 text-primary/60 hover:bg-secondary'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredProducts.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="p-4 rounded-3xl bg-secondary/10 border border-primary/5 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group flex flex-col justify-between h-full"
                                >
                                    <div>
                                        <div className="aspect-square rounded-2xl bg-white overflow-hidden mb-4 shadow-sm relative">
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-white/80 backdrop-blur-sm border border-primary/5 text-[8px] font-black text-primary uppercase">
                                                Stok: {product.stock}
                                            </div>
                                        </div>
                                        <h4 className="text-[11px] font-black text-primary leading-tight mb-1 truncate">{product.name}</h4>
                                        <p className="text-[9px] font-bold text-primary/50 uppercase tracking-widest mb-3">{product.category}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-xs font-black text-primary tracking-tighter">Rp {product.price.toLocaleString('id-ID')}</span>
                                        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Cart Summary */}
                <div className="w-full md:w-[400px] bg-secondary/20 flex flex-col h-full shadow-inner">
                    <div className="p-8 border-b border-primary/5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary relative">
                                <ShoppingCart className="w-5 h-5" />
                                {cart.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-gold text-primary text-[10px] font-black rounded-full flex items-center justify-center border-2 border-secondary/20 shadow-sm animate-bounce">
                                        {cart.reduce((a, b) => a + b.quantity, 0)}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-xl font-black text-primary tracking-tighter">Keranjang</h3>
                        </div>
                        <button onClick={onClose} className="hidden md:block p-2 rounded-xl text-primary/20 hover:text-primary transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-4 scrollbar-hide min-h-[300px]">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                                <Package className="w-12 h-12 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Keranjang Kosong</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="p-4 rounded-3xl bg-white border border-primary/5 shadow-sm animate-fade-in flex gap-4">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-[10px] font-black text-primary tracking-tight leading-tight uppercase w-[120px]">{item.name}</h4>
                                            <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="flex items-center gap-3 bg-secondary/30 rounded-xl px-2 py-1">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded-lg transition-all text-primary/40 hover:text-primary"><Minus className="w-3 h-3" /></button>
                                                <span className="text-[10px] font-black text-primary min-w-[15px] text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded-lg transition-all text-primary/40 hover:text-primary"><Plus className="w-3 h-3" /></button>
                                            </div>
                                            <span className="text-[11px] font-black text-primary">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Checkout Footer */}
                    <div className="p-8 bg-white border-t border-primary/5 space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-primary/60 font-bold text-[10px] uppercase tracking-widest px-1">
                                <span>Subtotal</span>
                                <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between text-primary/60 font-bold text-[10px] uppercase tracking-widest px-1">
                                <span>Pajak (11%)</span>
                                <span>Rp {(cartTotal * 0.11).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-primary/5 px-1">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Total</span>
                                <span className="text-2xl font-black text-primary tracking-tighter">Rp {(cartTotal * 1.11).toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setPaymentMethod('Tunai')}
                                    className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'Tunai' ? 'bg-primary text-secondary shadow-lg active:scale-95' : 'bg-secondary/40 text-primary/40 border border-primary/5 hover:bg-white'}`}
                                >
                                    <Banknote className="w-4 h-4" />
                                    <span>Tunai</span>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('E-Wallet')}
                                    className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'E-Wallet' ? 'bg-primary text-secondary shadow-lg active:scale-95' : 'bg-secondary/40 text-primary/40 border border-primary/5 hover:bg-white'}`}
                                >
                                    <CreditCard className="w-4 h-4" />
                                    <span>E-Wallet</span>
                                </button>
                            </div>

                            <button
                                disabled={cart.length === 0 || isProcessing}
                                onClick={handleCheckout}
                                className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 relative overflow-hidden group ${cart.length === 0 ? 'bg-primary/10 text-primary/20 pointer-events-none' : 'bg-primary text-secondary hover:scale-[1.02] active:scale-95 shadow-primary/20 hover:shadow-primary/40'}`}
                            >
                                <div className="relative z-10 flex items-center justify-center gap-3">
                                    {isProcessing ? (
                                        <div className="w-5 h-5 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                            <span>Selesaikan Pembayaran</span>
                                        </>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-full transition-all duration-1000" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    , document.body);
};

export default SalesPOSModal;
