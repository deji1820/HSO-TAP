import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "x-kiosk-key": import.meta.env.VITE_KIOSK_API_KEY },
});

export const lookupStudent = (studentId) => api.get(`/students/lookup/${studentId}`).then((r) => r.data);

export const submitIntake = (payload) => api.post("/kiosk/intake", payload).then((r) => r.data);
