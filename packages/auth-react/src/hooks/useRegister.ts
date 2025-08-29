import { useAuthContext } from "../context/AuthProvider";
export const useRegister = () => useAuthContext().register;
