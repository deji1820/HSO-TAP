import axios from "axios";

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hsotap_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = (email, password) => api.post("/auth/login", { email, password }).then((r) => r.data);
export const getQueue = () => api.get("/queue").then((r) => r.data);
export const updateQueueStatus = (id, status) => api.patch(`/queue/${id}/status`, { status }).then((r) => r.data);
export const getStudents = (q) => api.get("/students", { params: { q } }).then((r) => r.data);
export const getFullEmr = (id) => api.get(`/students/${id}/emr`).then((r) => r.data);
export const bulkUpload = (rows, mode) => api.post("/students/bulk-upload", { rows, mode }).then((r) => r.data);
export const getFormPipelines = () => api.get("/forms").then((r) => r.data);
export const getSyncLog = () => api.get("/forms/sync-log").then((r) => r.data);
