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

  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    technologies: Array.isArray(user?.technologies) ? user.technologies.join(', ') : '',
    location: user?.location || '',
    institute: user?.institute || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.bio || '',
        technologies: Array.isArray(user.technologies) ? user.technologies.join(', ') : '',
        location: user.location || '',
        institute: user.institute || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchUserProjects = async () => {
      try {
        const userId = user._id || user.id;
        const response = await getProjects(userId);
        setProjects(response.data);
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
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] overflow-hidden bg-white text-slate-900 pt-20 px-4 sm:px-8 lg:px-40 font-sans">
      <div className="w-full h-full flex flex-col md:flex-row gap-12 lg:gap-24">

        {/* Left Column: Profile Edit Form */}
        <div className="w-full md:w-1/3 h-full pr-4 pb-16">
          <div className="flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <img
                src={user?.profilePic || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {user?.name || "Student Name"}
                </h1>
                <p className="text-slate-500 text-sm">{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="w-full space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-slate-200 py-2 text-slate-800 focus:outline-none focus:border-slate-900 transition-colors resize-none text-sm"
                  rows="3"
                  placeholder="Tell your story..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Technologies</label>
                <input
                  type="text"
                  name="technologies"
                  value={formData.technologies}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-slate-200 py-2 text-slate-800 focus:outline-none focus:border-slate-900 transition-colors text-sm"
                  placeholder="React, Node.js, Python..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-slate-200 py-2 text-slate-800 focus:outline-none focus:border-slate-900 transition-colors text-sm"
                  placeholder="City, Country"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Institute</label>
                <input
                  type="text"
                  name="institute"
                  value={formData.institute}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-slate-200 py-2 text-slate-800 focus:outline-none focus:border-slate-900 transition-colors text-sm"
                  placeholder="University Name"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 bg-slate-900 text-white text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50 border-2 border-slate-900 hover:text-black"
                >
                  {isSaving ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Published Projects List */}
        <div className="w-full md:w-2/3 h-full overflow-y-auto no-scrollbar pr-4 pb-16">
          <div className="mb-10 pb-4 border-b border-slate-200">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Latest Publications</h2>
          </div>

          {loadingProjects ? (
            <div className="py-12 text-slate-500 text-sm">Loading stories...</div>
          ) : projects.length > 0 ? (
            <div className="flex flex-col gap-10">
              {projects.map(project => (
                <div key={project._id} className="flex flex-col sm:flex-row gap-6 items-start pb-10 border-b border-slate-100 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500 font-medium tracking-wide">
                        {new Date(project.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      <Link 
                        to={`/edit-project/${project._id}`} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        Edit Project
                      </Link>
                    </div>
                    <Link to={`/edit-project/${project._id}`} className="hover:underline hover:text-indigo-600 transition-colors inline-block mb-2">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">
                        {project.title}
                      </h3>
                    </Link>
                    <p className="text-slate-600 text-base mb-4 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-4">
                      {project.tags && project.tags.length > 0 && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                          {project.tags[0]}
                        </span>
                      )}
                      <div className="flex gap-3 text-slate-400">
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                          </a>
                        )}
                        {project.demoUrl && (
                          <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-full sm:w-32 h-32 flex-shrink-0">
                    <img
                      src={project.coverImage || "https://via.placeholder.com/150"}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12">
              <p className="text-slate-500 text-lg">You haven't published any projects yet.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StudentProfile;
