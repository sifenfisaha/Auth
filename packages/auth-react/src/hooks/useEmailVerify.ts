import { useAuthContext } from "../context/AuthProvider";
export const useEmailVerify = () => {
  const { requestVerification, confirmVerification } = useAuthContext();
  return { requestVerification, confirmVerification };
};
