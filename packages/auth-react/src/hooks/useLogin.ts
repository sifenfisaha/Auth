import { useAuthContext } from "../context/AuthProvider";
export const useLogin = () => useAuthContext().login;
