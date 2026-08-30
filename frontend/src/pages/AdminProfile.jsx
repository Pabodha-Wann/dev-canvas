import React, { useState } from 'react';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

const AdminProfile = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // Edit states
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [profilePic, setProfilePic] = useState(user?.profilePic || '');
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const roleColors = {
        ADMIN: { bg: 'linear-gradient(90deg,#7c3aed,#a78bfa)', label: 'Admin' },
        STUDENT: { bg: 'linear-gradient(90deg,#7c3aed,#818cf8)', label: 'Student' },
        RECRUITER: { bg: 'linear-gradient(90deg,#0ea5e9,#38bdf8)', label: 'Recruiter' },
    };
    const roleStyle = roleColors[user?.role] || { bg: '#94a3b8', label: user?.role };

    const adminPermissions = [
        'View all registered users',
        'Browse and manage all project submissions',
        'Delete any project from the system',
        'Full platform oversight & moderation',
    ];

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setErrorMsg('Name is required');
            return;
        }
        setIsSaving(true);
        setErrorMsg(null);
        try {
            const res = await authService.updateProfile(name, profilePic);
            if (res.success) {
                setIsEditing(false);
            } else {
                setErrorMsg(res.message || 'Failed to update profile');
            }
        } catch (err) {
            setErrorMsg('An unexpected error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setName(user?.name || '');
        setProfilePic(user?.profilePic || '');
        setErrorMsg(null);
        setIsEditing(false);
    };

    return (
        <div className="flex-1 w-full bg-white font-sans flex flex-col overflow-hidden max-h-[calc(100vh-65px)]">
            <style>{`
                @keyframes profileFadeIn {
                    from { opacity:0; transform:translateY(18px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                .profile-fade { animation: profileFadeIn 0.35s ease both; }
                .profile-fade-1 { animation: profileFadeIn 0.35s ease 0.05s both; }
                .profile-fade-2 { animation: profileFadeIn 0.35s ease 0.12s both; }
                .profile-fade-3 { animation: profileFadeIn 0.35s ease 0.20s both; }
            `}</style>

            <main className="max-w-3xl w-full mx-auto px-6 sm:px-10 py-4 flex flex-col gap-4 overflow-y-auto flex-1">

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="profile-fade self-start flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors cursor-pointer focus:outline-none"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    Back
                </button>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="profile-fade bg-red-50 border border-red-100 rounded-2xl px-5 py-3 text-red-600 font-semibold text-sm flex items-center gap-2.5">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {errorMsg}
                    </div>
                )}

                {/* Hero / Edit Card */}
                <div
                    className="profile-fade rounded-3xl overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg,#faf5ff 0%,#f5f3ff 60%,#ede9fe 100%)',
                        border: '1px solid #ede9fe',
                        boxShadow: '0 20px 60px -12px rgba(124,58,237,0.15)',
                    }}
                >
                    {/* Purple banner */}
                    <div style={{ height: 60, background: 'linear-gradient(135deg,#7c3aed 0%,#a78bfa 60%,#818cf8 100%)' }} />

                    {!isEditing ? (
                        <div className="px-8 pb-8" style={{ marginTop: -44 }}>
                            {/* Avatar */}
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                {user?.profilePic ? (
                                    <img
                                        src={user.profilePic}
                                        alt={user.name}
                                        style={{
                                            width: 88, height: 88, borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '4px solid #fff',
                                            boxShadow: '0 8px 24px rgba(124,58,237,0.22)',
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: 88, height: 88, borderRadius: '50%',
                                        background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 34, fontWeight: 900, color: '#fff',
                                        border: '4px solid #fff',
                                        boxShadow: '0 8px 24px rgba(124,58,237,0.25)',
                                    }}>
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {/* Online dot */}
                                <span style={{
                                    position: 'absolute', bottom: 6, right: 6,
                                    width: 14, height: 14, borderRadius: '50%',
                                    background: '#22c55e', border: '2.5px solid #fff',
                                }} />
                            </div>

                            {/* Name + badge */}
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                                    {user?.name}
                                </h1>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                    background: roleStyle.bg,
                                    color: '#fff', fontSize: 10.5, fontWeight: 800,
                                    letterSpacing: '0.08em', textTransform: 'uppercase',
                                    padding: '4px 12px', borderRadius: 999,
                                    boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
                                }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                    </svg>
                                    {roleStyle.label}
                                </span>
                            </div>

                            {/* Email + joined */}
                            <div className="mt-3 flex flex-wrap gap-5">
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: '#64748b', fontWeight: 500 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                    {user?.email}
                                </span>
                                {user?.createdAt && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: '#94a3b8', fontWeight: 500 }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                        </svg>
                                        Member since {formatDate(user.createdAt)}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="px-8 pb-8 flex flex-col gap-6" style={{ marginTop: -44 }}>
                            {/* Avatar Picker / Display */}
                            <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100/80">
                                <div style={{ position: 'relative' }} className="flex-shrink-0 group cursor-pointer" onClick={() => document.getElementById('avatar-file-input').click()}>
                                    {profilePic ? (
                                        <img
                                            src={profilePic}
                                            alt="Preview"
                                            style={{
                                                width: 96, height: 96, borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '4px solid #fff',
                                                boxShadow: '0 10px 25px -5px rgba(124,58,237,0.3)',
                                            }}
                                            className="group-hover:scale-105 transition-all duration-300"
                                        />
                                    ) : (
                                        <div style={{
                                            width: 96, height: 96, borderRadius: '50%',
                                            background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 38, fontWeight: 900, color: '#fff',
                                            border: '4px solid #fff',
                                            boxShadow: '0 10px 25px -5px rgba(124,58,237,0.3)',
                                        }} className="group-hover:scale-105 transition-all duration-300">
                                            {name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    {/* Upload overlay hover effect */}
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-4 border-transparent">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col gap-2 w-full text-center sm:text-left">
                                    <div className="flex flex-col gap-0.5">
                                        <label className="block text-xs font-bold text-purple-700 uppercase tracking-widest mb-1.5">
                                            Profile Photo
                                        </label>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1.5">
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('avatar-file-input').click()}
                                            style={{
                                                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                                border: 'none',
                                                color: '#fff', fontSize: 13, fontWeight: 700,
                                                padding: '9px 18px', borderRadius: 12,
                                                cursor: 'pointer', transition: 'all 0.2s ease',
                                                boxShadow: '0 4px 14px rgba(109,40,217,0.25)',
                                                display: 'inline-flex', alignItems: 'center', gap: 6
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(109,40,217,0.35)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(109,40,217,0.25)'; }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                            </svg>
                                            Choose Local Photo
                                        </button>
                                        {profilePic && (
                                            <button
                                                type="button"
                                                onClick={() => setProfilePic('')}
                                                style={{
                                                    background: '#fff', border: '1px solid #fecaca',
                                                    color: '#ef4444', fontSize: 13, fontWeight: 700,
                                                    padding: '9px 16px', borderRadius: 12,
                                                    cursor: 'pointer', transition: 'all 0.2s ease',
                                                    display: 'inline-flex', alignItems: 'center', gap: 6
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#fecaca'; }}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                                Remove Photo
                                            </button>
                                        )}
                                        <input
                                            id="avatar-file-input"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setProfilePic(reader.result);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="hidden"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1.5 justify-center sm:justify-start mt-1 text-slate-400">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="text-slate-400 flex-shrink-0">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.056 1.056L12 12.75M12 9h.008v.008H12V9zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>
                                            Supports JPG, PNG, GIF. Image details are processed in-browser.
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Name Input */}
                            <div>
                                <label className="block text-xs font-bold text-purple-700 uppercase tracking-widest mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Jane Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/70 border border-purple-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all shadow-sm"
                                />
                            </div>

                            {/* Form Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
                                        color: '#fff', fontSize: 13.5, fontWeight: 700,
                                        padding: '10px 20px', borderRadius: 12, border: 'none',
                                        boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
                                        cursor: 'pointer', transition: 'all 0.18s',
                                        opacity: isSaving ? 0.7 : 1,
                                    }}
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        background: '#fff', color: '#64748b', fontSize: 13.5, fontWeight: 700,
                                        padding: '10px 20px', borderRadius: 12,
                                        border: '1.5px solid #e2e8f0',
                                        cursor: 'pointer', transition: 'all 0.18s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Admin Permissions Card */}
                {user?.role === 'ADMIN' && (
                    <div
                        className="profile-fade-1 rounded-2xl"
                        style={{ border: '1px solid #f1f5f9', background: '#fafafa', padding: '22px 24px' }}
                    >
                        <h2 style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                            Admin Permissions
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {adminPermissions.map((perm) => (
                                <div key={perm} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                                        background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    </div>
                                    <span style={{ fontSize: 13.5, color: '#475569', fontWeight: 500 }}>{perm}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                {!isEditing && (
                    <div className="profile-fade-2 flex flex-wrap gap-3">
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
                                color: '#fff', fontSize: 13.5, fontWeight: 700,
                                padding: '10px 20px', borderRadius: 12, border: 'none',
                                boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
                                cursor: 'pointer', transition: 'all 0.18s',
                            }}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.83 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                            Edit Profile
                        </button>

                        {user?.role === 'ADMIN' && (
                            <button
                                onClick={() => navigate('/admin')}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    background: '#fff', color: '#7c3aed', fontSize: 13.5, fontWeight: 700,
                                    padding: '10px 20px', borderRadius: 12,
                                    border: '1.5px solid #ddd6fe',
                                    cursor: 'pointer', transition: 'all 0.18s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#f5f3ff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Open Dashboard
                            </button>
                        )}
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: '#fff', color: '#ef4444', fontSize: 13.5, fontWeight: 700,
                                padding: '10px 20px', borderRadius: 12,
                                border: '1.5px solid #fecaca',
                                cursor: 'pointer', transition: 'all 0.18s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                )}

            </main>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(8,12,30,0.55)' }}
                >
                    <div
                        className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-white shadow-2xl"
                        style={{ animation: 'profileModalPop 0.28s cubic-bezier(.34,1.56,.64,1) both' }}
                    >
                        <div style={{ background: 'linear-gradient(90deg,#ef4444,#f43f5e,#ec4899)', height: 4 }} />
                        <div className="p-8 flex flex-col items-center text-center gap-5">
                            <div className="relative flex items-center justify-center">
                                <span className="absolute inline-flex w-20 h-20 rounded-full opacity-20"
                                    style={{ background: '#ef4444', animation: 'profileModalPop 1.6s cubic-bezier(0,0,0.2,1) infinite' }} />
                                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg,#fee2e2,#fecdd3)', boxShadow: '0 8px 24px rgba(239,68,68,0.22)' }}>
                                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Sign Out?</h2>
                                <p className="text-slate-500 text-sm leading-relaxed">Are you sure you want to log out of your account?</p>
                            </div>
                            <div className="flex gap-3 w-full mt-1">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-600 text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer focus:outline-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => { setShowLogoutModal(false); authService.logout(); }}
                                    className="flex-1 py-3 rounded-xl border-none text-white text-sm font-bold cursor-pointer focus:outline-none transition-all hover:opacity-90"
                                    style={{ background: 'linear-gradient(135deg,#ef4444 0%,#f43f5e 60%,#ec4899 100%)', boxShadow: '0 4px 18px rgba(239,68,68,0.35)' }}
                                >
                                    Yes, Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes profileModalPop {
                    from { opacity:0; transform:scale(0.82) translateY(24px); }
                    to   { opacity:1; transform:scale(1)   translateY(0); }
                }
            `}</style>
        </div>
    );
}


export default AdminProfile