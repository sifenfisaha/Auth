const ACCESS_KEY = "access_token";

let BASE_URL = "";

export const setBaseUrl = (url: string) => {
  BASE_URL = url;
};

export const tokenManager = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  },
  setAccessToken(token: string) {
    localStorage.setItem(ACCESS_KEY, token);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
  },
  async refreshAccessToken(): Promise<string> {
    const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to refresh token");

    const data = await res.json();
    this.setAccessToken(data.accessToken);
    return data.accessToken;
  },
};
