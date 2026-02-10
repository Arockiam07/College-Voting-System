import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" }
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);
var api_default = api;
const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  signup: (data) => api.post("/auth/signup", data)
};
const electionAPI = {
  getAll: () => api.get("/elections"),
  create: (data) => api.post("/elections", data),
  update: (id, data) => api.put(`/elections/${id}`, data),
  updateStatus: (id, status) => api.patch(`/elections/${id}/status`, { status }),
  delete: (id) => api.delete(`/elections/${id}`),
  getResults: (id) => api.get(`/elections/${id}/results`)
};
const candidateAPI = {
  getAll: (electionId) => api.get("/candidates", { params: electionId ? { electionId } : {} }),
  create: (data) => api.post("/candidates", data),
  update: (id, data) => api.put(`/candidates/${id}`, data),
  delete: (id) => api.delete(`/candidates/${id}`)
};
const voteAPI = {
  cast: (data) => api.post("/votes", data),
  getStatus: (electionId) => api.get(`/votes/status`, { params: { electionId } }),
  getMyHistory: () => api.get("/votes/history")
};
const dashboardAPI = {
  getAdminStats: () => api.get("/dashboard/admin"),
  getResults: (electionId) => api.get(`/elections/${electionId}/results`)
};
export {
  authAPI,
  candidateAPI,
  dashboardAPI,
  api_default as default,
  electionAPI,
  voteAPI
};
