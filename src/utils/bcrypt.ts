import bcrypt from "bcryptjs";

export const hashpassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (plain: string, hashed: string) => {
  return await bcrypt.compare(plain, hashed);
};
