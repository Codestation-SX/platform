import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL,
});

export const backofficeApi = axios.create({
  baseURL: `${baseURL}/api/backoffice`,
});
