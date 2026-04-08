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
  const finalKey = rawKey.startsWith("$") ? rawKey : `$${rawKey}`;
  console.log("[Asaas] URL:", config.baseURL, config.url);
  console.log("[Asaas] API Key (primeiros 20 chars):", finalKey.substring(0, 20));
  config.headers["access_token"] = finalKey;
  return config;
});
