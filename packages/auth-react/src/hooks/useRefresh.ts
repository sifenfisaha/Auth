import { useAuthContext } from "../context/AuthProvider";
export const useRefresh = () => useAuthContext().refresh;
