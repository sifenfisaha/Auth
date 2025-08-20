import type { AuthConfig } from "../types/config";

let config: AuthConfig;

export const setAuthConfig = (newConfig: AuthConfig) => {
  config = newConfig;
};

export const getAuthConfig = (): AuthConfig => {
  if (!config)
    throw new Error("AuthConfig not initialized. Call auth(config) first.");
  return config;
};
