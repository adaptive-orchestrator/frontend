// src/lib/api/project.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = import.meta.env.VITE_API_BASE;

// Projects
export const getProjects = async () => {
  const token = Cookies.get('token');
  const res = await axios.get(`${API_BASE}/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getProjectById = async (id: number) => {
  const token = Cookies.get('token');
  const res = await axios.get(`${API_BASE}/projects/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createProject = async (data: any) => {
  const token = Cookies.get('token');
  const res = await axios.post(`${API_BASE}/projects`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateProject = async (id: number, data: any) => {
  const token = Cookies.get('token');
  const res = await axios.put(`${API_BASE}/projects/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteProject = async (id: number) => {
  const token = Cookies.get('token');
  const res = await axios.delete(`${API_BASE}/projects/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Tasks
export const getProjectTasks = async (projectId: number) => {
  const token = Cookies.get('token');
  const res = await axios.get(`${API_BASE}/projects/${projectId}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createTask = async (projectId: number, data: any) => {
  const token = Cookies.get('token');
  const res = await axios.post(`${API_BASE}/projects/${projectId}/tasks`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateTask = async (taskId: number, data: any) => {
  const token = Cookies.get('token');
  const res = await axios.put(`${API_BASE}/projects/tasks/${taskId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteTask = async (taskId: number) => {
  const token = Cookies.get('token');
  const res = await axios.delete(`${API_BASE}/projects/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getProjectAnalytics = async (projectId: number) => {
  const token = Cookies.get('token');
  const res = await axios.get(`${API_BASE}/projects/${projectId}/analytics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
