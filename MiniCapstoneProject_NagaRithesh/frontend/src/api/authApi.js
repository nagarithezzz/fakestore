import { axiosInstance } from "./axiosInstance.js";

export async function register(body) {
  const { data } = await axiosInstance.post("/auth/register", body);
  return data;
}

export async function login(body) {
  const { data } = await axiosInstance.post("/auth/login", body);
  return data;
}
