// Create, read, update, delete project logic
const eventBus = require("../events/eventBus");

const createProject = async (req, res) => {
  const project = await Project.create({ ...req.body, studentId: req.user.id });
  // emit AFTER successful save
  eventBus.emit("project:created", {
    project,
    creator: req.user,
  });
  res.status(201).json(project);
};
