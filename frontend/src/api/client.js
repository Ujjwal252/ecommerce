import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to set / remove Authorization header at runtime
export function setAuthToken(token) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

// If token already stored in localStorage (page reload), set it
const savedToken = localStorage.getItem("token");
if (savedToken) setAuthToken(savedToken);

export default apiClient;
