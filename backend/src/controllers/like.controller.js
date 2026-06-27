// Like and unlike logic
const eventBus = require("../events/eventBus");

const toggleLike = async (req, res) => {
  const existing = await Like.findOne({ projectId, userId: req.user.id });

  if (existing) {
    await existing.deleteOne();
    return res.json({ liked: false });
  }

  await Like.create({ projectId, userId: req.user.id });
  const project = await Project.findById(projectId);

  // only emit when ADDING a like
  eventBus.emit("project:liked", {
    project,
    likedBy: req.user,
  });

  res.json({ liked: true });
};
