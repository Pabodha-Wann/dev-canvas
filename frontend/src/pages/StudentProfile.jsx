import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { getProjects } from '../api/project.api';
import { updateProfile } from '../api/user.api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const StudentProfile = () => {
  const { user, setUser } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    technologies: Array.isArray(user?.technologies) ? user.technologies.join(', ') : '',
    location: user?.location || '',
    institute: user?.institute || '',
    contactNumber: user?.contactNumber || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.bio || '',
        technologies: Array.isArray(user.technologies) ? user.technologies.join(', ') : '',
        location: user.location || '',
        institute: user.institute || '',
        contactNumber: user.contactNumber || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchUserProjects = async () => {
      try {
        const userId = user?._id || user?.id;
        if (!userId) return;
        const response = await getProjects(userId);
        setProjects(response.data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects.");
      } finally {
        setLoadingProjects(false);
      }
    };
    if (user && (user._id || user.id)) {
      fetchUserProjects();
    }
  }, [user]);

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

  const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());

  const getDisplayUsername = (u) => {
    if (u?.username && !isUuid(u.username)) return u.username;
    if (u?.email && !u.email.endsWith('@asgardeo.local')) return u.email.split('@')[0];
    if (u?.name && !isUuid(u.name)) return u.name.toLowerCase().replace(/\s+/g, '');
    return 'student';
  };

  const getDisplayName = (u) => {
    if (u?.name && !isUuid(u.name)) return u.name;
    if (u?.username && !isUuid(u.username)) return u.username;
    if (u?.email && !u.email.endsWith('@asgardeo.local')) return u.email.split('@')[0];
    return 'Student User';
  };

  const getDisplayEmail = (u) => {
    if (u?.email && !u.email.endsWith('@asgardeo.local')) return u.email;
    if (u?.username && u.username.includes('@')) return u.username;
    return 'Not provided';
  };

  const usernameDisplay = getDisplayUsername(user);
  const nameDisplay = getDisplayName(user);
  const emailDisplay = getDisplayEmail(user);
  const userInitials = nameDisplay ? nameDisplay.charAt(0).toUpperCase() : 'S';

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50/50 pb-16 font-sans text-slate-900">
      
      {/* ── Hero Banner Header ────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* Profile Avatar */}
              <div className="relative group">
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.name}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover ring-4 ring-white/20 shadow-2xl bg-white"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-black text-4xl ring-4 ring-white/20 shadow-2xl">
                    {userInitials}
                  </div>
                )}
                <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full ring-4 ring-slate-900 shadow-md">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>

              {/* Identity & Basic Details */}
              <div className="flex flex-col justify-center">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                    {nameDisplay}
                  </h1>
                  <span className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md">
                    Student
                  </span>
                </div>

                <p className="text-purple-300 font-semibold text-base mt-1 flex items-center justify-center sm:justify-start gap-1">
                  <span>@{usernameDisplay}</span>
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs sm:text-sm text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {emailDisplay}
                  </span>

                  {user?.contactNumber && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {user.contactNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                  isEditing 
                    ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700' 
                    : 'bg-purple-600 hover:bg-purple-500 text-white border border-purple-500'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {isEditing ? "View Profile" : "Edit Profile"}
              </button>

              <Link
                to="/upload"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Upload Project
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* ── Main Content Area ────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 -mt-6 relative z-20">
        
        {/* EDIT PROFILE MODAL / FORM SECTION */}
        {isEditing ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xl transition-all animate-fadeIn mb-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Edit Portfolio Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">Update your contact details, bio, and academic background.</p>
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
                    Contact Number <span className="text-purple-600 font-medium text-[10px]">(Asgardeo / Personal)</span>
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                    placeholder="+94 77 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                    placeholder="Colombo, Sri Lanka"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Institute / University</label>
                  <input
                    type="text"
                    name="institute"
                    value={formData.institute}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                    placeholder="University of Moratuwa / SLIIT"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Technologies <span className="text-slate-400 text-[10px] normal-case">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    name="technologies"
                    value={formData.technologies}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                    placeholder="React, Node.js, Python, MongoDB"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Bio / Professional Summary</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none"
                  placeholder="Passionate full-stack student developer interested in web software, cloud services, and open-source projects..."
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
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
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
            
            {/* Primary Profile Account Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-purple-700 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Account Info
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Verified Student
                </span>
              </div>

              <div className="space-y-4">
                {/* 1. Username */}
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100/60">
                  <span className="block text-[11px] font-extrabold text-purple-900 uppercase tracking-wider">
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
                    {user?.contactNumber || (
                      <span className="text-slate-400 italic text-xs">Not specified (Click edit to add)</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Academic & Location Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Campus & Location
              </h3>

              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Institute</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    {user?.institute || <span className="text-slate-400 text-xs font-normal italic">Not specified</span>}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Location</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {user?.location || <span className="text-slate-400 text-xs font-normal italic">Not specified</span>}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Bio, Technologies & Published Projects */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Bio & Skills Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm">
              <div className="mb-5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About & Portfolio Summary
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed font-medium">
                  {user?.bio || (
                    <span className="text-slate-400 italic">No bio added yet. Click "Edit Profile" above to share your background and goals.</span>
                  )}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Technologies & Skills</h4>
                {Array.isArray(user?.technologies) && user.technologies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-xs font-bold uppercase tracking-wide"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">No technologies listed yet.</p>
                )}
              </div>
            </div>

            {/* Published Projects Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">My Published Projects</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Projects showcase and published works on DevCanvas.</p>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                  {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
                </span>
              </div>

              {loadingProjects ? (
                <div className="py-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  Loading projects...
                </div>
              ) : projects.length > 0 ? (
                <div className="space-y-6">
                  {projects.map((project) => (
                    <div
                      key={project._id}
                      className="group flex flex-col sm:flex-row gap-5 p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all bg-slate-50/50 hover:bg-white"
                    >
                      {/* Thumbnail */}
                      <div className="w-full sm:w-40 h-28 shrink-0 rounded-lg overflow-hidden bg-slate-200 border border-slate-200">
                        <img
                          src={project.coverImage || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80"}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <Link
                              to={`/projects/${project._id}`}
                              className="font-bold text-lg text-slate-900 hover:text-purple-600 transition-colors line-clamp-1"
                            >
                              {project.title}
                            </Link>
                            
                            <Link
                              to={`/edit-project/${project._id}`}
                              className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 text-xs font-semibold rounded-md transition-colors flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              Edit
                            </Link>
                          </div>

                          <p className="text-slate-600 text-xs mt-1 line-clamp-2 leading-relaxed">
                            {project.description}
                          </p>
                        </div>

                        {/* Project Footer Meta */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/60 text-xs text-slate-400">
                          <span className="font-medium">
                            {new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>

                          <div className="flex items-center gap-3">
                            {project.githubUrl && (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 font-medium"
                              >
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                Code
                              </a>
                            )}
                            {project.demoUrl && (
                              <a
                                href={project.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1 font-semibold"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Demo
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">No projects published yet</h3>
                  <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                    Share your coursework, side projects, or innovations with potential recruiters and peers.
                  </p>
                  <Link
                    to="/upload"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                  >
                    Upload First Project
                  </Link>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default StudentProfile;
