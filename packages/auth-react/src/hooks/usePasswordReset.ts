import { useAuthContext } from "../context/AuthProvider";
export const usePasswordReset = () => {
  const { forgotPassword, resetPassword } = useAuthContext();
  return { forgotPassword, resetPassword };
};
