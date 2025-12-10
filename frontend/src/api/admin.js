// frontend/src/api/admin.js
import apiClient from "./client";

export async function getAdminDashboard() {
  const res = await apiClient.get("/admin/dashboard");
  return res.data;
}
