import axios from "axios";
import { tokenManager } from "./tokenManager";

export const createClient = (baseURL: string) => {
  const client = axios.create({
    baseURL,
    withCredentials: true,
  });

  client.interceptors.request.use((config) => {
    const token = tokenManager.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const res = await axios.post(
            `${baseURL}/auth/refresh-token`,
            {},
            { withCredentials: true }
          );
          const newToken = res.data.accessToken;
          tokenManager.setAccessToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        } catch {
          tokenManager.clear();
          return Promise.reject(error);
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};
