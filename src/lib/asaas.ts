// lib/asaas.ts
import axios from "axios";

export const apiAsaas = axios.create({
  baseURL: process.env.ASAAS_API_URL || "https://api-sandbox.asaas.com/v3",
  headers: {
    accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiAsaas.interceptors.request.use((config) => {
  const rawKey = process.env.ASAAS_API_KEY ?? "";
  config.headers["access_token"] = rawKey.startsWith("$") ? rawKey : `$${rawKey}`;
  return config;
});
