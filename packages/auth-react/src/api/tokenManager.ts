const ACCESS_KEY = "access_token";

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
};
