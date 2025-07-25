import bcrypt from "bcryptjs";

export const hashpassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = (plain: string, hashed: string) => {
  return bcrypt.compare(plain, hashed);
};
