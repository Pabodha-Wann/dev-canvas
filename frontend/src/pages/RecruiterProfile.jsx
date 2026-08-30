import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { toggleFollow, getFollowStatus, getFollowerCount } from '../api/follow.api';

const RecruiterProfile = ({ profile: profileProp }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const isRecruiter = user?.role === 'RECRUITER';
  const profile = profileProp || location.state?.profile || user || null;

  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(profile?.followerCount ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFollowerCount(profile?.followerCount ?? 0);
  }, [profile]);

  useEffect(() => {
    const syncFollowState = async () => {
      if (!profile?._id || !isRecruiter || profile._id === user?._id) return;

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
  }, [profile, isRecruiter, user?._id]);

  const handleFollowToggle = async () => {
    if (!profile?._id || loading || !isRecruiter || profile._id === user?._id) return;

    try {
      setLoading(true);
      setError('');

      const response = await toggleFollow(profile._id);
      const nextFollowing = Boolean(response.data?.following);

      setFollowing(nextFollowing);
      setFollowerCount((current) => current + (nextFollowing ? 1 : -1));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update follow state');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex-1 px-6 py-10 text-slate-600">
        No profile selected.
      </div>
    );
  }

  const showFollowButton = isRecruiter && profile._id !== user?._id;

  return (
    <div className="flex-1 px-6 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
            <p className="mt-2 text-slate-600">{profile.email}</p>
          </div>

          {showFollowButton && (
            <button
              type="button"
              onClick={handleFollowToggle}
              disabled={loading}
              aria-pressed={following}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                following
                  ? 'bg-slate-100 text-slate-800 border border-slate-200'
                  : 'bg-purple-600 text-white hover:bg-purple-500'
              } disabled:opacity-60`}
            >
              {following ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
          <span>Followers {followerCount}</span>
          <span>{profile.role}</span>
        </div>

        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      </div>
    </div>
  );
};

export default RecruiterProfile;
