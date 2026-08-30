import React from 'react';

const LoginPage = () => {
  const handleAsgardeoLogin = () => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    window.location.href = `${baseURL}/auth/asgardeo`;
  };

  const handleGoogleLogin = () => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    window.location.href = `${baseURL}/auth/google`;
  };

  return (
    <div className="flex h-screen w-screen bg-white font-sans overflow-hidden">
      {/* Left side - Image Hero (Only visible on large screens) */}
      <div className="hidden lg:flex lg:w-1/2 p-6 h-full flex-col box-border">
        <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-lg">
          {/* Main Hero Photo */}
          <img
            src="https://images.unsplash.com/photo-1603201667230-bd139210db18?q=80&w=1188&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Students collaborating"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark Gradient Overlay for text contrast */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/10 flex flex-col justify-end p-12">
            <h2 className="text-white text-5xl font-bold leading-tight mb-4 tracking-tight max-w-lg">
              Showcase Your Tech with Clarity
            </h2>
            <p className="text-slate-200 text-base leading-relaxed max-w-md">
              DevCanvas helps you showcase your innovations, connect with recruiters, and track computing coursework feedback all in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-between items-center p-8 sm:p-12 md:p-16 box-border">
        {/* Empty placeholder for alignment */}
        <div className="hidden lg:block h-8"></div>

        <div className="w-full max-w-md flex flex-col my-auto">
          {/* Top Logo */}
          <div className="flex items-center gap-2.5 mb-8 justify-center lg:justify-start">

            <span className="text-2xl font-bold bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
              DevCanvas
            </span>
          </div>

          {/* Form Header */}
          <div className="text-center lg:text-left mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Welcome to DevCanvas</h1>
            <p className="text-slate-500 text-sm">Please sign in with your enterprise OIDC account to access your workspace</p>
          </div>

          {/* Asgardeo OIDC Action (Primary) */}
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={handleAsgardeoLogin}
              className="w-full py-4 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-3 transition-all focus:outline-none cursor-pointer text-base shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
              Sign in with Asgardeo (OIDC)
            </button>

            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 px-6 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold flex items-center justify-center gap-3 transition-all focus:outline-none cursor-pointer text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full text-center">
          <p className="text-slate-400 text-xs">
            Faculty of Computing &copy; 2026. Need assistance? <a href="#" className="text-purple-600 font-semibold hover:underline">Contact your admin.</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
