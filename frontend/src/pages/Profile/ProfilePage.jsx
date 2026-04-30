import React, { useState, useRef } from 'react';
import {
    UserCircleIcon,
    PencilSquareIcon,
    CheckIcon,
    XMarkIcon,
    EnvelopeIcon,
    PhoneIcon,
    BriefcaseIcon,
    CalendarDaysIcon,
    MapPinIcon,
    CameraIcon,
} from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import CustomDatePicker from '../../components/UI/CustomDatePicker';
import ConfirmModal from '../../components/UI/ConfirmModal';


const roleBadgeColor = {
    Dokter: 'bg-blue-100 text-blue-600',
    'Customer Service': 'bg-emerald-100 text-emerald-600',
    HRD: 'bg-violet-100 text-violet-600',
    'Supervisor Treatment': 'bg-amber-100 text-amber-600',
    'Supervisor Produk': 'bg-amber-100 text-amber-600',
};

const ProfilePage = () => {
    const { user, updateProfile } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        position: user?.position || user?.role || '',
        joinDate: user?.joinDate || '2023-01-01',
        address: user?.address || '',
        bio: user?.bio || '',
        avatar: user?.avatar || null,
    });
    const [preview, setPreview] = useState(user?.avatar || null);
    const [confirmConfig, setConfirmConfig] = useState(null);
    const fileRef = useRef();


    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setPreview(ev.target.result);
            setForm((prev) => ({ ...prev, avatar: ev.target.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        setConfirmConfig({
            icon: 'save',
            header: 'Simpan Profil?',
            message: 'Yakin ingin menyimpan perubahan profil Anda?',
            acceptLabel: 'Ya, Simpan',
            onAccept: () => {
                if (updateProfile) updateProfile(form);
                setIsEditing(false);
            }
        });
    };


    const handleCancel = () => {
        setForm({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            position: user?.position || user?.role || '',
            joinDate: user?.joinDate || '2023-01-01',
            address: user?.address || '',
            bio: user?.bio || '',
            avatar: user?.avatar || null,
        });
        setPreview(user?.avatar || null);
        setIsEditing(false);
    };

    const badgeClass = roleBadgeColor[user?.role] || 'bg-gray-100 text-gray-600';

    const InfoRow = ({ icon: Icon, label, field, type = 'text' }) => (
        <div className="flex items-start gap-4 py-4 border-b border-primary/5 last:border-0">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-1">{label}</p>
                {isEditing ? (
                    type === 'date' ? (
                        <CustomDatePicker
                            value={form[field]}
                            onChange={(val) => setForm(prev => ({ ...prev, [field]: val }))}
                            className="-ml-4 -mt-2"
                        />
                    ) : (
                        <input
                            name={field}
                            type={type}
                            value={form[field]}
                            onChange={handleChange}
                            className="w-full text-sm font-semibold text-primary bg-secondary/60 border border-primary/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                        />
                    )
                ) : (
                    <p className="text-sm font-semibold text-primary truncate">{form[field] || <span className="text-primary/30 italic">Not set</span>}</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">My Profile</h2>
                    <p className="text-primary/40 mt-2 md:mt-3 font-bold text-sm">View and manage your personal information</p>
                </div>

                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary/15 text-primary/60 font-bold text-xs hover:bg-primary/5 active:scale-95 transition-all duration-200"
                            >
                                <XMarkIcon className="w-4 h-4" />Batal</button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300"
                            >
                                <CheckIcon className="w-4 h-4" />
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-xs shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300"
                        >
                            <PencilSquareIcon className="w-4 h-4" />
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Avatar Card */}
                <div className="bg-white rounded-[2rem] border border-primary/5 shadow-2xl shadow-primary/5 p-8 flex flex-col items-center text-center gap-4">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-primary/10 overflow-hidden bg-secondary flex items-center justify-center">
                            {preview ? (
                                <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircleIcon className="w-20 h-20 text-primary/30" />
                            )}
                        </div>
                        {isEditing && (
                            <button
                                onClick={() => fileRef.current.click()}
                                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                            >
                                <CameraIcon className="w-8 h-8 text-white" />
                            </button>
                        )}
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>

                    {/* Name & Role */}
                    {isEditing ? (
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="text-center w-full text-xl font-black text-primary bg-secondary/60 border border-primary/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                        />
                    ) : (
                        <h3 className="text-xl font-black text-primary tracking-tight">{form.name}</h3>
                    )}

                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${badgeClass}`}>
                        {user?.role}
                    </span>

                    {isEditing ? (
                        <input
                            name="position"
                            value={form.position}
                            onChange={handleChange}
                            placeholder="Job title / Position"
                            className="text-center w-full text-sm font-semibold text-primary/60 bg-secondary/60 border border-primary/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                        />
                    ) : (
                        <p className="text-sm font-semibold text-primary/50">{form.position || user?.role}</p>
                    )}
                </div>

                {/* Right: Info Card */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] border border-primary/5 shadow-2xl shadow-primary/5 p-8">
                    <h4 className="text-lg font-black text-primary tracking-tight mb-2">Personal Information</h4>
                    <p className="text-xs font-bold text-primary/30 mb-6">Your contact details and workplace information</p>

                    <div className="divide-y divide-primary/5">
                        <InfoRow icon={EnvelopeIcon} label="Email Address" field="email" type="email" />
                        <InfoRow icon={PhoneIcon} label="Phone Number" field="phone" type="tel" />
                        <InfoRow icon={BriefcaseIcon} label="Position / Title" field="position" />
                        <InfoRow icon={CalendarDaysIcon} label="Join Date" field="joinDate" type="date" />
                        <InfoRow icon={MapPinIcon} label="Address" field="address" />
                    </div>
                </div>
            </div>
            <ConfirmModal
                config={confirmConfig}
                onClose={() => setConfirmConfig(null)}
            />
        </div>
    );
};



export default ProfilePage;
