// CRUD routes for projects
import express from 'express';
import multer from 'multer';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/project.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const projectUpload = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'extraImages', maxCount: 10 },
]);

const router = express.Router();

router.post('/', authMiddleware, projectUpload, createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', authMiddleware, projectUpload, updateProject);
router.delete('/:id', authMiddleware, deleteProject);

export default router;

