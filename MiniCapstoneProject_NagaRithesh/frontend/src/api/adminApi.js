import { axiosInstance } from "./axiosInstance.js";

export async function getReports() {
  const { data } = await axiosInstance.get("/admin/reports");
  return data;
}

export async function listUsers() {
  const { data } = await axiosInstance.get("/admin/users");
  return data;
}
