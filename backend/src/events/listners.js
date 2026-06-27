const eventBus = require("./eventBus");
const {
  createProjectNotification,
  createLikeNotification,
} = require("../services/notification.service");

eventBus.on("project:created", async ({ project, creator }) => {
  await createProjectNotification(project, creator);
});

eventBus.on("project:liked", async ({ project, likedBy }) => {
  await createLikeNotification(project, likedBy);
});
