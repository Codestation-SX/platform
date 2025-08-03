// lib/asaas.ts
import axios from "axios";

export const apiAsaas = axios.create({
  baseURL: process.env.ASAAS_API_URL || "https://api-sandbox.asaas.com/v3",
  headers: {
    accept: "application/json",
    "Content-Type": "application/json",
    access_token: process.env.ASAAS_API_KEY
      ? `$${process.env.ASAAS_API_KEY}`
      : "",
  },
});
