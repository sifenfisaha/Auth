import React, { createContext, useContext, useEffect, useState } from "react";
import { tokenManager } from "../api/tokenManager";
import { createClient } from "../api/client";
import { endpoints } from "../api/endpoint";
import type { User } from "../types/types";
import { AuthContextType } from "../types/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  baseURL: string;
  children: React.ReactNode;
}> = ({ baseURL, children }) => {
  const client = createClient(baseURL);

  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    tokenManager.getAccessToken()
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await client.get(endpoints.me);
        setUser(res.data.user);
        setAccessToken(tokenManager.getAccessToken());
      } catch {
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [client]);

  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const res = await client.post(endpoints.login, { email, password });
    tokenManager.setAccessToken(res.data.accessToken);
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
  };

  const register = async ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) => {
    const res = await client.post(endpoints.register, {
      name,
      email,
      password,
    });
    tokenManager.setAccessToken(res.data.accessToken);
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
  };

  const logout = async () => {
    await client.post(endpoints.logout);
    tokenManager.clear();
    setAccessToken(null);
    setUser(null);
  };

  const refresh = async () => {
    const res = await client.post(endpoints.refresh);
    tokenManager.setAccessToken(res.data.accessToken);
    setAccessToken(res.data.accessToken);
  };

  const requestVerification = async (email: string) => {
    await client.post(endpoints.requestVerification, { email });
  };

  const confirmVerification = async (otp: string) => {
    await client.post(endpoints.confirmVerification, { otp });
  };

  const forgotPassword = async (email: string) => {
    await client.post(endpoints.forgotPassword, { email });
  };

  const resetPassword = async (otp: string, newPassword: string) => {
    await client.post(endpoints.resetPassword, { otp, newPassword });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        accessToken,
        login,
        register,
        logout,
        refresh,
        requestVerification,
        confirmVerification,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
};
