import { axiosInstance } from "./axiosInstance.js";

export async function listMyCdr(params = {}) {
  const { data } = await axiosInstance.get("/cdr/my", { params });
  return data;
}

export async function addCdr(body) {
  const { data } = await axiosInstance.post("/cdr", body);
  return data;
}
