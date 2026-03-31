import { axiosInstance } from "./axiosInstance.js";

export async function listMyBills() {
  const { data } = await axiosInstance.get("/billing/my");
  return data;
}

export async function payBill(billingId) {
  const { data } = await axiosInstance.put(`/billing/pay/${billingId}`);
  return data;
}

export async function generateBill(body) {
  const { data } = await axiosInstance.post("/billing/generate", body);
  return data;
}
