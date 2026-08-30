import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authService } from '../services/auth.service';
import { navigationConfig } from '../routing/navigationConfig';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const navLinks = navigationConfig[user?.role] || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle scroll to add background to navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeLinkClass = ({ isActive }) =>
    `relative px-1 py-1 mx-3 text-xs font-bold uppercase tracking-[0.1em] transition-all duration-300 ${isActive
      ? 'text-slate-900 border-b-2 border-purple-600'
      : 'text-slate-500 border-b-2 border-transparent hover:text-slate-900'
    }`;

  const uploadBtnClass = "px-6 py-2.5 ml-4 bg-slate-900 text-white text-xs font-bold uppercase tracking-[0.1em] rounded-full hover:bg-black transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] border border-slate-800";

  return (
    <nav className={`sticky top-0 z-50 px-6 sm:px-12 flex justify-between items-center w-full box-border transition-all duration-300 ${
      isScrolled 
        ? 'py-3 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200' 
        : 'py-5 bg-transparent border-b border-transparent'
    }`}>
      {/* Left side - Logo & Name */}
      <NavLink to="/" className="flex items-center gap-3.5 no-underline">
        <div className="grid grid-cols-2 gap-1 w-6 h-6 rotate-45">
          <div className="bg-purple-600 rounded-sm w-2.5 h-2.5"></div>
          <div className="bg-purple-400 rounded-sm w-2.5 h-2.5"></div>
          <div className="bg-purple-500/70 rounded-sm w-2.5 h-2.5"></div>
          <div className="bg-indigo-600 rounded-sm w-2.5 h-2.5"></div>
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">
          DevCanvas
        </span>
      </NavLink>

      {/* Middle Section - Navigation Links (Desktop) */}
      <div className="hidden md:flex items-center gap-2">
        {navLinks.map((link) => (
          link.path === '/upload' ? (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              className={uploadBtnClass}
            >
              {link.label}
            </NavLink>
          ) : (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              className={activeLinkClass}
            >
              {link.label}
            </NavLink>
          )
        ))}
      </div>

      {/* Right Side Actions (Desktop) */}
      <div className="hidden md:flex items-center gap-6">
        {user && <NotificationBell />}
        {user && (
          <div className="relative" ref={dropdownRef}>
            {/* Profile button - clicking opens dropdown */}
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-3 focus:outline-none cursor-pointer"
            >
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={user.name}
                  className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold text-slate-800 leading-none">{user.name}</span>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mt-1">{user.role}</span>
              </div>
              {/* Chevron */}
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-50">
                {/* My Profile - Available for all logged-in roles */}
                <button
                  onClick={() => { setIsDropdownOpen(false); navigate('/profile'); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  My Profile
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button
                  onClick={() => { setIsDropdownOpen(false); setShowLogoutModal(true); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile menu hamburger button */}
      <div className="md:hidden flex items-center gap-3">
        {user && <NotificationBell />}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-600 hover:text-slate-900 focus:outline-none cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 flex flex-col gap-4 shadow-lg md:hidden">
          {navLinks.map((link) => (
            link.path === '/upload' ? (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold uppercase tracking-[0.1em] text-xs transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.15)] mt-2"
              >
                {link.label}
              </NavLink>
            ) : (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-600 hover:text-slate-900 font-bold uppercase tracking-widest text-xs py-2 px-2"
              >
                {link.label}
              </NavLink>
            )
          ))}
          <div className="h-px bg-slate-100 my-1"></div>
          {user && (
            <div className="flex items-center gap-3 py-1.5">
              {user.profilePic && (
                <img
                  src={user.profilePic}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                />
              )}
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold text-slate-800 leading-none">{user.name}</span>
                <span className="text-xs text-purple-600 font-bold mt-1 uppercase tracking-wider">{user.role}</span>
              </div>
            </div>
          )}
          {/* Dashboard link in mobile - ADMIN only -> Moved to Main Nav */}
          <button
            onClick={() => { setIsMobileMenuOpen(false); setShowLogoutModal(true); }}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-all cursor-pointer"
          >
            Logout
          </button>
        </div>
      )}
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(8,12,30,0.55)' }}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-white shadow-2xl"
            style={{ animation: 'logoutModalPop 0.28s cubic-bezier(.34,1.56,.64,1) both' }}
          >
            {/* Top gradient band */}
            <div style={{ background: 'linear-gradient(90deg,#ef4444,#f43f5e,#ec4899)', height: 4 }} />

            <div className="p-8 flex flex-col items-center text-center gap-5">
              {/* Icon */}
              <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex w-20 h-20 rounded-full opacity-20"
                  style={{ background: '#ef4444', animation: 'logoutModalPop 1.6s cubic-bezier(0,0,0.2,1) infinite' }} />
                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#fee2e2,#fecdd3)', boxShadow: '0 8px 24px rgba(239,68,68,0.22)' }}>
                  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
              </div>

              {/* Heading */}
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Sign Out?</h2>
                <p className="text-slate-500 text-sm leading-relaxed">Are you sure you want to log out of your account?</p>
              </div>

              {/* Buttons */}
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
        @keyframes logoutModalPop {
          from { opacity:0; transform:scale(0.82) translateY(24px); }
          to   { opacity:1; transform:scale(1)   translateY(0); }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
