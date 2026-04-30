import React from 'react';
import { createPortal } from 'react-dom';
import { X, User, CreditCard, Calendar, Hash, Package, Clock, Receipt, Printer, ArrowRight } from 'lucide-react';

const TransactionDetailModal = ({ isOpen, onClose, transaction }) => {
    if (!isOpen || !transaction) return null;

    // Detailed mock items for the receipt view
    const items = [
        { name: transaction.product || 'Layanan Kesehatan', qty: 1, price: transaction.amount || '0' },
        { name: 'Biaya Administrasi', qty: 1, price: 'Rp 10.000' },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Selesai': return 'bg-green-100/20 text-white border-green-200/50';
            case 'Menunggu': return 'bg-yellow-100/20 text-yellow-700 border-yellow-200/50';
            case 'Cancelled': return 'bg-red-100/20 text-red-700 border-red-200/50';
            default: return 'bg-gray-100/20 text-gray-700 border-gray-200/50';
        }
    };

    const generateThermalReceipt = () => {
        // Asumsi Lebar Kertas 58mm = 32 Karakter per baris
        const LINE_WIDTH = 32;

        const centerText = (text) => {
            if (text.length >= LINE_WIDTH) return text.substring(0, LINE_WIDTH);
            const padLeft = Math.floor((LINE_WIDTH - text.length) / 2);
            const padRight = LINE_WIDTH - text.length - padLeft;
            return ' '.repeat(padLeft) + text + ' '.repeat(padRight);
        };

        const leftRightText = (left, right) => {
            const spaces = LINE_WIDTH - left.length - right.length;
            if (spaces > 0) {
                return left + ' '.repeat(spaces) + right;
            } else {
                return left.substring(0, LINE_WIDTH - right.length - 1) + ' ' + right;
            }
        };

        const line = '-'.repeat(LINE_WIDTH);

        let receiptText = '';
        
        // Header
        receiptText += centerText('KLINIK KECANTIKAN') + '\n';
        receiptText += centerText('PERSONAL BEAUTY') + '\n';
        receiptText += centerText('Jl. Raya Jember No.1') + '\n';
        receiptText += centerText('Telp: 0812-3456-7890') + '\n';
        receiptText += line + '\n';

        // Info
        receiptText += `ID   : ${transaction.id}\n`;
        receiptText += `TGL  : ${transaction.date}\n`;
        // Nama pasien
        const customer = transaction.customer ? transaction.customer.substring(0, 20) : 'Umum';
        receiptText += `CUST  : ${customer}\n`;
        receiptText += `KASIR: FITRI - CS CAB. JEMBER\n`;
        receiptText += line + '\n';

        // Items
        items.forEach(item => {
            receiptText += leftRightText(item.name.substring(0, 18), `${item.qty}x`) + '\n';
            receiptText += leftRightText('', item.price) + '\n';
        });

        receiptText += line + '\n';
        receiptText += leftRightText('Subtotal', transaction.amount || 'Rp 450.000') + '\n';
        receiptText += leftRightText('PPN (11%)', 'Rp 49.500') + '\n';
        receiptText += line + '\n';
        receiptText += leftRightText('TOTAL', 'Rp 550.000') + '\n';
        receiptText += line + '\n';
        
        // Footer
        receiptText += centerText('Terima Kasih Atas') + '\n';
        receiptText += centerText('Kunjungan Anda') + '\n';
        receiptText += '\n\n'; // Feed paper
        
        console.log("===== FORMAT PRINTER THERMAL (58mm) =====");
        console.log(receiptText);
        alert("Konversi teks Thermal Printer siap dikirim ke Bluetooth:\n\n" + receiptText);
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 transition-opacity animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Floating Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all z-[60] shadow-sm border border-white/10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header Section (Consistent with other modals) */}
                <div className="relative p-8 bg-primary overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10 z-0">
                        <div className="absolute top-0 left-0 w-full h-full" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>

                    <div className="relative z-10 flex items-center gap-5 pr-12">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-sm border border-white/10 shadow-inner">
                            <Receipt className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tighter leading-none italic">Detail Transaksi</h3>
                            <div className="flex items-center gap-3 mt-3">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{transaction.id}</span>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(transaction.status)}`}>
                                    {transaction.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide bg-gray-50/30">
                    {/* Customer & Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-3xl bg-white border border-primary/5 space-y-4 shadow-sm group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-2 mb-2 text-primary/30 uppercase tracking-[0.2em] font-black text-[9px]">
                                <User className="w-3 h-3 text-primary/40" /> Info Konsumen
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-sm font-black text-primary border border-primary/5 group-hover:scale-110 transition-transform">
                                    {transaction.customer.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <p className="text-base font-black text-primary leading-tight">{transaction.customer}</p>
                                    <p className="text-[10px] font-bold text-primary/40 uppercase mt-1 tracking-wider">ID: PAS-00124 • Reguler</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-white border border-primary/5 space-y-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2 text-primary/30 uppercase tracking-[0.2em] font-black text-[9px]">
                                <Calendar className="w-3 h-3 text-primary/40" /> Info Waktu
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-primary/30 uppercase tracking-widest">Tanggal</span>
                                    <span className="text-primary font-black tracking-tight bg-secondary/30 px-3 py-1 rounded-lg">{transaction.date}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-primary/30 uppercase tracking-widest">Jam Transaksi</span>
                                    <span className="text-primary font-black tracking-tight bg-secondary/30 px-3 py-1 rounded-lg">14:30 WIB</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary/30 uppercase tracking-[0.2em] font-black text-[9px]">
                            <Package className="w-3 h-3 text-primary/40" /> Daftar Layanan & Stok
                        </div>
                        <div className="rounded-[2rem] border border-primary/5 overflow-hidden shadow-sm bg-white">
                            <table className="w-full text-left">
                                <thead className="bg-secondary/10 text-[8px] font-black uppercase tracking-[0.2em] text-primary/40 border-b border-primary/5">
                                    <tr>
                                        <th className="px-8 py-5">Sublayanan / Stok</th>
                                        <th className="px-8 py-5 text-center">Qty</th>
                                        <th className="px-8 py-5 text-right">Harga</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5 font-bold">
                                    {items.map((item, idx) => (
                                        <tr key={idx} className="text-xs text-primary group hover:bg-secondary/10 transition-colors">
                                            <td className="px-8 py-5 font-black uppercase tracking-tight">{item.name}</td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="inline-block px-2 py-0.5 rounded-lg bg-primary/5 text-primary/60 text-[10px]">{item.qty}x</span>
                                            </td>
                                            <td className="px-8 py-5 text-right font-black italic">{item.price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-primary p-9 rounded-[2.5rem] text-secondary shadow-2xl shadow-primary/30 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000 scale-150">
                            <Hash className="w-24 h-24" />
                        </div>
                        <div className="relative z-10 space-y-5">
                             <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
                                <span>Subtotal</span>
                                <span>{transaction.amount}</span>
                             </div>
                             <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
                                <span>Pajak PPN (11%)</span>
                                <span>Rp 49.500</span>
                             </div>
                             <div className="h-px bg-white/10 my-6" />
                             <div className="flex justify-between items-center">
                                <div className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">Total Tagihan</div>
                                <div className="text-3xl font-black tracking-tighter italic text-secondary-light">
                                    Rp 550.000
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Footer Info Metadata */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-primary/30 px-2">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2"><CreditCard className="w-3 h-3 text-primary/20" /> Metode: <span className="text-primary font-black opacity-80">E-Wallet (OVO)</span></div>
                            <div className="flex items-center gap-2"><Clock className="w-3 h-3 text-primary/20" /> Kasir: <span className="text-primary font-black opacity-80 uppercase">Fitri - CS Cab. Jember</span></div>
                        </div>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-8 bg-white border-t border-primary/5 flex gap-4 shrink-0">
                    <button 
                        onClick={generateThermalReceipt}
                        className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 group"
                    >
                        <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>Cetak Struk Resmi</span>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default TransactionDetailModal;
