import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { toggleFollow, getFollowStatus, getFollowerCount } from '../api/follow.api';
import { updateProfile } from '../api/user.api';
import { toast } from 'react-toastify';

const RecruiterProfile = ({ profile: profileProp }) => {
  const location = useLocation();
  const { user, setUser } = useAuthStore();
  const isRecruiterRole = user?.role === 'RECRUITER';
  
  const rawProfile = profileProp || location.state?.profile || user || null;
  const isOwnProfile = Boolean(
    !profileProp && (!location.state?.profile || rawProfile?._id === user?._id || rawProfile?.id === user?.id)
  );

  const profile = isOwnProfile ? user : rawProfile;

  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(profile?.followerCount ?? 0);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    bio: profile?.bio || '',
    technologies: Array.isArray(profile?.technologies) ? profile.technologies.join(', ') : '',
    location: profile?.location || '',
    institute: profile?.institute || '',
    contactNumber: profile?.contactNumber || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFollowerCount(profile?.followerCount ?? 0);
      setFormData({
        bio: profile.bio || '',
        technologies: Array.isArray(profile.technologies) ? profile.technologies.join(', ') : '',
        location: profile.location || '',
        institute: profile.institute || '',
        contactNumber: profile.contactNumber || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    const syncFollowState = async () => {
      if (!profile?._id || !isRecruiterRole || isOwnProfile) return;

      try {
        const [statusResponse, countResponse] = await Promise.all([
          getFollowStatus(profile._id),
          getFollowerCount(profile._id),
        ]);

        setFollowing(Boolean(statusResponse.data?.following));
        setFollowerCount(countResponse.data?.count ?? 0);
      } catch {
        setFollowing(false);
        setFollowerCount(profile?.followerCount ?? 0);
      }
    };

    syncFollowState();
  }, [profile, isRecruiterRole, isOwnProfile]);

  const handleFollowToggle = async () => {
    if (!profile?._id || loadingFollow || !isRecruiterRole || isOwnProfile) return;

    try {
      setLoadingFollow(true);
      setError('');

      const response = await toggleFollow(profile._id);
      const nextFollowing = Boolean(response.data?.following);

      setFollowing(nextFollowing);
      setFollowerCount((current) => current + (nextFollowing ? 1 : -1));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update follow state');
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await updateProfile(formData);
      setUser(response.data);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 text-slate-500 font-sans">
        <p className="text-base font-semibold">No profile selected.</p>
      </div>
    );
  }

  const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());

  const getDisplayUsername = (u) => {
    if (u?.username && !isUuid(u.username)) return u.username;
    if (u?.email && !u.email.endsWith('@asgardeo.local')) return u.email.split('@')[0];
    if (u?.name && !isUuid(u.name)) return u.name.toLowerCase().replace(/\s+/g, '');
    return 'recruiter';
  };

  const getDisplayName = (u) => {
    if (u?.name && !isUuid(u.name)) return u.name;
    if (u?.username && !isUuid(u.username)) return u.username;
    if (u?.email && !u.email.endsWith('@asgardeo.local')) return u.email.split('@')[0];
    return 'Recruiter User';
  };

  const getDisplayEmail = (u) => {
    if (u?.email && !u.email.endsWith('@asgardeo.local')) return u.email;
    if (u?.username && u.username.includes('@')) return u.username;
    return 'Not provided';
  };

  const usernameDisplay = getDisplayUsername(profile);
  const nameDisplay = getDisplayName(profile);
  const emailDisplay = getDisplayEmail(profile);
  const userInitials = nameDisplay ? nameDisplay.charAt(0).toUpperCase() : 'R';
  const showFollowButton = isRecruiterRole && !isOwnProfile;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50/50 pb-16 font-sans text-slate-900">
      
      {/* ── Hero Banner Header ────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white relative overflow-hidden">
        {/* Background Decorative Grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* Profile Avatar */}
              <div className="relative group">
                {profile?.profilePic ? (
                  <img
                    src={profile.profilePic}
                    alt={profile.name}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover ring-4 ring-white/20 shadow-2xl bg-white"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-4xl ring-4 ring-white/20 shadow-2xl">
                    {userInitials}
                  </div>
                )}
                <span className="absolute -bottom-2 -right-2 bg-sky-500 text-white p-1.5 rounded-full ring-4 ring-slate-900 shadow-md">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>

              {/* Details */}
              <div className="flex flex-col justify-center">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                    {nameDisplay}
                  </h1>
                  <span className="px-3 py-1 bg-sky-500/20 border border-sky-400/30 text-sky-200 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md">
                    {profile?.role || "Recruiter"}
                  </span>
                </div>

                <p className="text-sky-300 font-semibold text-base mt-1 flex items-center justify-center sm:justify-start gap-1">
                  <span>@{usernameDisplay}</span>
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs sm:text-sm text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {emailDisplay}
                  </span>

                  {profile?.contactNumber && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {profile.contactNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions / Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                    isEditing 
                      ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700' 
                      : 'bg-sky-600 hover:bg-sky-500 text-white border border-sky-500'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {isEditing ? "View Profile" : "Edit Profile"}
                </button>
              )}

              {showFollowButton && (
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  disabled={loadingFollow}
                  aria-pressed={following}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer ${
                    following
                      ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                      : 'bg-purple-600 hover:bg-purple-500 text-white border border-purple-500'
                  } disabled:opacity-60`}
                >
                  {following ? 'Following' : '+ Follow Recruiter'}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── Main Content Area ────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 -mt-6 relative z-20">
        
        {/* EDIT PROFILE MODAL / FORM SECTION */}
        {isOwnProfile && isEditing ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xl transition-all animate-fadeIn mb-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Edit Recruiter Profile</h2>
                <p className="text-xs text-slate-500 mt-0.5">Update your contact information, organization, and professional overview.</p>
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Contact Number <span className="text-sky-600 font-medium text-[10px]">(Asgardeo / Business)</span>
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                    placeholder="+94 77 987 6543"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                    placeholder="Colombo, Sri Lanka"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Organization / Company</label>
                  <input
                    type="text"
                    name="institute"
                    value={formData.institute}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                    placeholder="Tech Talent Corp / University Partner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Industry Focus / Technologies <span className="text-slate-400 text-[10px] normal-case">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    name="technologies"
                    value={formData.technologies}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                    placeholder="Full Stack, Cloud Computing, AI / ML"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Bio / Recruitment Focus</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all resize-none"
                  placeholder="Senior Talent Acquisition Specialist looking for outstanding student software projects, innovative web apps, and top engineering talent..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Saving Changes..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {/* ── PROFILE DASHBOARD GRID ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* LEFT COLUMN: Required Assignment Profile Fields Card */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Primary Account Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-sky-700 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Account Info
                </h3>
                <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                  Verified Recruiter
                </span>
              </div>

              <div className="space-y-4">
                {/* 1. Username */}
                <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100/60">
                  <span className="block text-[11px] font-extrabold text-sky-900 uppercase tracking-wider">
                    Username
                  </span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block truncate">
                    @{usernameDisplay}
                  </span>
                </div>

                {/* 2. Full Name */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Full Name
                  </span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block truncate">
                    {nameDisplay}
                  </span>
                </div>

                {/* 3. Email Address */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Email Address
                  </span>
                  <span className="text-sm font-semibold text-slate-800 mt-0.5 block truncate">
                    {emailDisplay}
                  </span>
                </div>

                {/* 4. Contact Number */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Contact Number
                  </span>
                  <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
                    {profile?.contactNumber || (
                      <span className="text-slate-400 italic text-xs">Not specified</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Organization & Location Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Company & Location
              </h3>

              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Organization / Company</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-2">
                    <svg className="w-4 h-4 text-sky-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {profile?.institute || <span className="text-slate-400 text-xs font-normal italic">Not specified</span>}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Location</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {profile?.location || <span className="text-slate-400 text-xs font-normal italic">Not specified</span>}
                  </span>
                </div>
              </div>
            </div>

            {/* Follower Stats Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-around text-center">
              <div>
                <span className="text-2xl font-black text-slate-900 block">{followerCount}</span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Followers</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <span className="text-2xl font-black text-sky-600 block">{profile?.role || 'Recruiter'}</span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Platform Role</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Bio & Technologies/Focus Areas */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Bio Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm">
              <div className="mb-5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recruiter Profile & Overview
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed font-medium">
                  {profile?.bio || (
                    <span className="text-slate-400 italic">No overview specified yet.</span>
                  )}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Industry Focus & Skill Interest</h4>
                {Array.isArray(profile?.technologies) && profile.technologies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-sky-50 text-sky-700 border border-sky-100 rounded-lg text-xs font-bold uppercase tracking-wide"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">No technology focus listed yet.</p>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                {error}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default RecruiterProfile;
