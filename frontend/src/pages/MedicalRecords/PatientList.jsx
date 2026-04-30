import React, { useState } from 'react';
import { Search, Plus, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../context/MockDataContext';
import CustomSelect from '../../components/UI/CustomSelect';
import MedicalRecordFormModal from '../../components/UI/MedicalRecordFormModal';
import TableSkeleton from '../../components/UI/TableSkeleton';
import EmptyState from '../../components/UI/EmptyState';

const PatientList = () => {
    const { patients } = useMockData();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Simulate loading
    React.useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const filteredPatients = patients.filter(patient => {
        const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All Status' || patient.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            <MedicalRecordFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Rekam Medis</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm">Kelola History Pasien dan Perawatan</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Rekam Medis</span>
                </button>
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[1rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="p-4 md:p-8 border-b border-primary/5 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 bg-primary/5">
                    {/* ... (Search & Select bars) ... */}
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari nama pasien atau ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all"
                        />
                    </div>
                    <div className="w-48 relative z-50">
                        <CustomSelect
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: 'All Status', label: 'All Status' },
                                { value: 'Aktif', label: 'Aktif' },
                                { value: 'Selesai', label: 'Selesai' }
                            ]}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <TableSkeleton rows={8} columns={6} />
                ) : (
                    <>
                        <div className="hidden md:block overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] border-b border-primary/5 bg-gray-50/30">
                                <th className="px-4 py-3 text-primary/80">Nama Pasien</th>
                                <th className="px-4 py-3 text-primary/80">Umur</th>
                                <th className="px-4 py-3 text-primary/80">Terakhir Visit</th>
                                <th className="px-4 py-3 text-primary/80">Treatment</th>
                                <th className="px-4 py-3 text-center text-primary/80">Status</th>
                                <th className="px-4 py-3 text-right text-primary/80">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {filteredPatients.map((patient) => (
                                <tr
                                    key={patient.id}
                                    onClick={() => navigate(`/medical-records/${patient.id}`)}
                                    className="border-b border-primary/5 last:border-0 cursor-pointer"
                                >
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-secondary shadow-sm flex items-center justify-center text-primary font-medium text-xs border border-primary/5">
                                                {patient.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                                            </div>
                                            <div className="font-medium text-primary text-sm tracking-tight">{patient.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-primary/80 font-medium text-sm tracking-tight">{patient.age} Thn</td>
                                    <td className="px-4 py-2 text-primary/80 font-medium text-sm">{patient.lastVisit}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-2 text-primary font-medium text-sm">
                                            <FileText className="w-3.5 h-3.5 text-primary/40" />
                                            {patient.condition}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm border border-white/50 ${patient.status === 'Aktif' ? 'bg-primary/10 text-primary' :
                                            patient.status === 'Selesai' ? 'bg-accent-gold/10 text-accent-gold' :
                                                'bg-red-50 text-red-500'
                                            }`}>
                                            {patient.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <button className="text-primary/40 hover:text-primary transition-all duration-300 p-2 rounded-xl hover:bg-white hover:shadow-sm active:scale-90">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-primary/5">
                    {filteredPatients.map((patient) => (
                        <div
                            key={patient.id}
                            onClick={() => navigate(`/medical-records/${patient.id}`)}
                            className="p-6 border-b border-primary/5 last:border-0 flex items-center gap-4 cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-secondary shadow-sm flex items-center justify-center text-primary font-black text-xs border border-primary/5 shrink-0">
                                {patient.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1 gap-2">
                                    <h4 className="font-black text-primary text-sm tracking-tight truncate">{patient.name}</h4>
                                    <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-full shadow-sm shrink-0 ${patient.status === 'Aktif' ? 'bg-primary/10 text-primary' :
                                        patient.status === 'Selesai' ? 'bg-accent-gold/10 text-accent-gold' :
                                            'bg-red-50 text-red-400'
                                        }`}>
                                        {patient.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-primary/40 font-bold uppercase tracking-wider">
                                    <div className="flex items-center gap-2 truncate">
                                        <FileText className="w-3 h-3 text-primary/20" />
                                        <span className="truncate">{patient.condition}</span>
                                    </div>
                                    <span className="shrink-0">{patient.lastVisit}</span>
                                </div>
                                <div className="mt-2 text-[9px] text-primary/30 font-black uppercase tracking-widest">
                                    ID: {patient.id} • {patient.age} Thn
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredPatients.length === 0 && (
                        <EmptyState 
                            type="records"
                            title="Data Medis Tidak Ditemukan"
                            description="Sistem tidak menemukan riwayat medis yang sesuai dengan pencarian Anda."
                        />
                    )}
                </div>
                    </>
                )}

                <div className="p-6 md:p-8 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40 bg-primary/5">
                    <span>Menampilkan {filteredPatients.length} dari {patients.length} data</span>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-primary/10 bg-white hover:bg-primary hover:text-secondary transition-all duration-500 disabled:opacity-30 active:scale-95 shadow-sm">Sebelumnya</button>
                        <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-primary/10 bg-white hover:bg-primary hover:text-secondary transition-all duration-500 active:scale-95 shadow-sm">Selanjutnya</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientList;
