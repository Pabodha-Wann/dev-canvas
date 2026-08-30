import User from '../models/User.js';
import Project from '../models/Project.js';
import Follower from '../models/Follower.js';

export const updateUserService = async (userId, data) => {
  const { bio, technologies, location, institute } = data;
  
  let techArray = [];
  if (typeof technologies === 'string') {
    techArray = technologies.split(',').map((t) => t.trim()).filter((t) => t);
  } else if (Array.isArray(technologies)) {
    techArray = technologies;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        bio,
        technologies: techArray,
        location,
        institute,
      },
    },
    { new: true, runValidators: true }
  ).select('-__v');

  return updatedUser;
};

export const getUserByIdService = async (id) => {
  const user = await User.findById(id)
    .select('name email profilePic role bio technologies location institute createdAt');

  if (!user) {
    return null;
  }

  const [projects, followerCount] = await Promise.all([
    Project.find({ studentId: id }).sort({ createdAt: -1 }),
    Follower.countDocuments({ followingId: id }),
  ]);

  return { user, projects, followerCount };
};
