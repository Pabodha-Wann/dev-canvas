import * as projectService from '../services/project.service.js';

export const createProject = async (req, res) => {
  try {
    const project = await projectService.createProject(req.body, req.files, req.user);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await projectService.getProjects(req.query.userId);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.json(project);
  } catch (err) {
    if (err.message === 'Project not found') {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(500).json({ message: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body, req.files, req.user.id);
    res.json(project);
  } catch (err) {
    if (err.message === 'Project not found') return res.status(404).json({ message: err.message });
    if (err.message === 'Unauthorized') return res.status(403).json({ message: err.message });
    res.status(500).json({ message: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const result = await projectService.deleteProject(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    if (err.message === 'Project not found') return res.status(404).json({ message: err.message });
    if (err.message === 'Unauthorized') return res.status(403).json({ message: err.message });
    res.status(500).json({ message: err.message });
  }
};