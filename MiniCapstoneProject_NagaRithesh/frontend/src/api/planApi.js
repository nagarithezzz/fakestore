import { axiosInstance } from "./axiosInstance.js";

export async function listPlans() {
  const { data } = await axiosInstance.get("/plans");
  return data;
}

export async function createPlan(body) {
  const { data } = await axiosInstance.post("/plans", body);
  return data;
}
