import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, FileText, Gift } from 'lucide-react';
import { useMockData } from '../../context/MockDataContext';
import { useAuth } from '../../context/AuthContext';
import { pasienAPI, wilayahAPI } from '../../services/api';
import TableSkeleton from '../../components/UI/TableSkeleton';

const PatientDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('stok');
    const { getPatient } = useMockData();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [apiPatient, setApiPatient] = useState(null);
    const [kabKotaName, setKabKotaName] = useState('-');
    const [kecamatanName, setKecamatanName] = useState('-');

    // Fetch dari API atau gunakan Mock
    useEffect(() => {
        const fetchPatientDetail = async () => {
            setIsLoading(true);
            if (user?.token) {
                try {
                    const res = await pasienAPI.getById(user.token, id);
                    if (res.success && res.data) {
                        setApiPatient(res.data);
                    }
                } catch (error) {
                    console.error("Gagal mengambil detail pasien dari API:", error);
                }
            }
            // Delay sedikit untuk UX (opsional)
            setTimeout(() => setIsLoading(false), 800);
        };

        fetchPatientDetail();
    }, [id, user?.token, activeTab]);

    // Fetch nama KabKota berdasarkan ID
    useEffect(() => {
        if (apiPatient?.KabKota_id && user?.token) {
            wilayahAPI.getKabKota(user.token).then(res => {
                if (res.success && res.data) {
                    const dataArray = Array.isArray(res.data) ? res.data : (res.data.data || []);
                    const found = dataArray.find(k => k.id == apiPatient.KabKota_id);
                    if (found) {
                        setKabKotaName(found.nama || found.name || found.KabKota || found.kabupaten_kota || `Kab/Kota ${found.id}`);
                    }
                }
            });
        }
    }, [apiPatient?.KabKota_id, user?.token]);

    // Fetch nama Kecamatan berdasarkan ID
    useEffect(() => {
        if (apiPatient?.KabKota_id && apiPatient?.Kec_id && user?.token) {
            wilayahAPI.getKecamatan(user.token, apiPatient.KabKota_id).then(res => {
                if (res.success && res.data) {
                    const dataArray = Array.isArray(res.data) ? res.data : (res.data.data || []);
                    const found = dataArray.find(k => k.id == apiPatient.Kec_id);
                    if (found) {
                        setKecamatanName(found.nama || found.name || found.Kecamatan || found.kecamatan || `Kecamatan ${found.id}`);
                    }
                }
            });
        }
    }, [apiPatient?.KabKota_id, apiPatient?.Kec_id, user?.token]);

    const mockPatient = getPatient(id);
    const isApiData = !!apiPatient;

    // Jika tidak ada di API maupun Mock Data
    if (!isLoading && !apiPatient && !mockPatient) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-primary/40">
                <FileText className="w-12 h-12 mb-3" />
                <p className="font-bold text-sm">Pasien tidak ditemukan.</p>
            </div>
        );
    }

    const patientDetail = isApiData ? {
        name: apiPatient.Nama_pasien || '-',
        tier: apiPatient.Tipe_member || apiPatient.tipe_member || apiPatient.Tipe_Member || 'Non Member',
        noMember: apiPatient.no_member || '-',
        noRM: apiPatient.no_RM || '-',
        noIdentitas: apiPatient.no_Identitas || '-',
        tanggalLahir: apiPatient.Tanggal_Lahir || '-',
        kabupatenKota: kabKotaName !== '-' ? kabKotaName : (apiPatient.kabkota?.nama || apiPatient.kabkota?.name || '-'),
        kecamatan: kecamatanName !== '-' ? kecamatanName : (apiPatient.kecamatan?.nama || apiPatient.kecamatan?.name || '-'),
    } : {
        name: mockPatient?.namaLengkap || mockPatient?.name,
        tier: mockPatient?.tipeMember || 'Non Member',
        noMember: mockPatient?.noMember || '-',
        noRM: mockPatient?.noRM || '-',
        noIdentitas: mockPatient?.noIdentitas || '-',
        tanggalLahir: mockPatient?.tanggalLahir || '-',
        kabupatenKota: mockPatient?.kabupatenKota || '-',
        kecamatan: mockPatient?.kecamatan || '-',
    };

    // Gunakan data riwayat point dari pasien jika ada, atau array kosong
    const pointHistory = isApiData ? [] : (mockPatient?.pointHistory || []);

    // Gunakan data riwayat stok dari pasien jika ada, atau array kosong
    const productHistory = isApiData ? [] : (mockPatient?.productHistory || []);

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            {/* Header & Back Button */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-3 rounded-2xl bg-white border border-primary/5 shadow-sm hover:scale-105 active:scale-95 transition-all text-primary"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-primary tracking-tighter leading-none">Detail Pasien</h2>
                    <p className="text-primary/40 mt-1 font-bold text-xs uppercase tracking-widest">Informasi Lengkap & Riwayat Transaksi</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* KOLOM KIRI: Identitas & Poin */}
                <div className="space-y-6">
                    {/* Kartu Profil */}
                    <div className="bg-white rounded-[2rem] border border-primary/5 shadow-xl shadow-primary/5 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

                        {/* Avatar */}
                        <div className="flex flex-col items-center text-center mb-8 relative z-10">
                            <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center mb-4 overflow-hidden">
                                <svg className="w-14 h-14 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-black text-primary tracking-tight">{patientDetail.name}</h3>
                            <span className={`inline-block mt-2 px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                                patientDetail.tier === 'Member' 
                                ? 'bg-accent-gold/10 text-accent-gold border border-accent-gold/20' 
                                    : 'bg-gray-100 text-gray-500'
                            }`}>
                                {patientDetail.tier}
                            </span>
                        </div>

                        {/* Info Grid */}
                        <div className="relative z-10 space-y-5">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                                <div>
                                    <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1">No Member</p>
                                    <p className="font-bold text-teal-500 text-sm">{patientDetail.noMember}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1">No. RM</p>
                                    <p className="font-bold text-teal-500 text-sm">{patientDetail.noRM}</p>
                                </div>
                            </div>
                            <div className="h-px w-full bg-primary/5" />
                            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                                <div>
                                    <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1">No. Identitas</p>
                                    <p className="font-bold text-teal-500 text-sm break-all">{patientDetail.noIdentitas}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1">Tanggal Lahir</p>
                                    <p className="font-bold text-teal-500 text-sm">{patientDetail.tanggalLahir}</p>
                                </div>
                            </div>
                            <div className="h-px w-full bg-primary/5" />
                            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                                <div>
                                    <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1">Kabupaten/Kota</p>
                                    <p className="font-bold text-teal-500 text-sm">{patientDetail.kabupatenKota}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1">Kecamatan</p>
                                    <p className="font-bold text-teal-500 text-sm">{patientDetail.kecamatan}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KOLOM KANAN: Riwayat Transaksi */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] border border-primary/5 shadow-xl shadow-primary/5 overflow-hidden flex flex-col h-full">
                    <div className="flex items-center justify-between border-b border-primary/5 p-4 md:p-6 bg-primary/5">
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setActiveTab('stok')}
                                className={`px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'stok' ? 'bg-primary text-secondary shadow-lg' : 'text-primary/40 hover:bg-white'}`}
                            >
                                Riwayat Stok
                            </button>
                            <button 
                                onClick={() => setActiveTab('treatment')}
                                className={`px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'treatment' ? 'bg-primary text-secondary shadow-lg' : 'text-primary/40 hover:bg-white'}`}
                            >
                                Riwayat Treatment
                            </button>
                        </div>
                    </div>

                    <div className="p-6 flex-1 bg-gray-50/50 space-y-6">
                        {isLoading ? (
                            <TableSkeleton mode="card" rows={3} />
                        ) : (
                            <>
                                {activeTab === 'stok' ? (
                                    productHistory.length > 0 ? productHistory.map((trx, index) => (
                                        <div key={index} className="bg-white rounded-2xl border border-primary/5 shadow-sm overflow-hidden">
                                            <div className="bg-teal-600 px-4 py-2 text-white font-black text-[10px] tracking-widest inline-block rounded-br-2xl mb-2">
                                                {trx.id}
                                            </div>
                                            <div className="p-5 pt-0">
                                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-primary/5">
                                                    <span className="font-bold text-primary/60 text-sm">Total Order: Rp {trx.total.toLocaleString('id-ID')}</span>
                                                    <span className="flex items-center gap-1.5 text-xs text-primary/40 font-bold"><Calendar className="w-3.5 h-3.5" /> {trx.date}</span>
                                                </div>
                                                <ul className="space-y-2">
                                                    {trx.items.map((item, idx) => (
                                                        <li key={idx} className="flex justify-between items-center text-sm font-bold text-primary">
                                                            <span>{item}</span>
                                                            <span className="text-teal-500">1</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="flex flex-col items-center justify-center h-48 text-primary/30">
                                            <FileText className="w-12 h-12 mb-3" />
                                            <p className="font-bold text-sm tracking-wide">Belum ada riwayat stok.</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-48 text-primary/30">
                                        <FileText className="w-12 h-12 mb-3" />
                                        <p className="font-bold text-sm tracking-wide">Belum ada riwayat treatment.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDetailPage;