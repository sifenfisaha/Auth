import { useAuthContext } from "../context/AuthProvider";
export const useLogout = () => useAuthContext().logout;
