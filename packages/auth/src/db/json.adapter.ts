import fs from "fs";
import path from "path";
export interface DevUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  isVerified: boolean;
  refreshTokens: string[];
  verificationToken: string;
  verificationTokenExpires: string;
  resetPasswordToken: string;
  resetPasswordExpires: string;
}

const dbPath = path.join(process.cwd(), "users.json");

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([]));
}

const readUsers = (): DevUser[] => {
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data);
};

const writeUsers = (users: DevUser[]) => {
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
};

export const jsonUserAdapter = {
  getUserById: async (id: string) => {
    const users = readUsers();
    return users.find((u) => u._id === id) || null;
  },
  getUserByEmail: async (email: string) => {
    const users = readUsers();
    return users.find((u) => u.email === email) || null;
  },
  createUser: async (data: Partial<DevUser>) => {
    const users = readUsers();
    const newUser: DevUser = {
      _id: Date.now().toString(),
      name: data.name!,
      email: data.email!,
      password: data.password!,
      role: "user",
      isVerified: false,
      refreshTokens: [],
      verificationToken: "",
      verificationTokenExpires: new Date(Date.now() + 3600000).toISOString(),
      resetPasswordToken: "",
      resetPasswordExpires: new Date(Date.now() + 3600000).toISOString(),
    };
    users.push(newUser);
    writeUsers(users);
    return newUser;
  },
  updateUser: async (id: string, data: Partial<DevUser>) => {
    const users = readUsers();
    const index = users.findIndex((u) => u._id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...data };
    writeUsers(users);
    return users[index];
  },
  deleteUser: async (id: string) => {
    const users = readUsers();
    const filtered = users.filter((u) => u._id !== id);
    if (filtered.length === users.length) return false;
    writeUsers(filtered);
    return true;
  },
  getUserByVerificationOtp: async () => null,
  getUserByResetPasswordOtp: async () => null,
};
