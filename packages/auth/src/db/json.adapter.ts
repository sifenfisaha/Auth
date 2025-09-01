import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "users.json"); // root of user's project

// Ensure file exists
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([]));
  console.log("[auth] Created users.json in project root (devMode)");
}

const readUser = () => {
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data);
};

const writeUsers = (users: any[]) => {
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
};

export const jsonUserAdapter = {
  getUserById: async (id: string) => {
    const users = readUser();
    return users.find((u: any) => u.id === id) || null;
  },
  getUserByEmail: async (email: string) => {
    const users = readUser();
    return users.find((u: any) => u.email === email) || null;
  },
  createUser: async (data: any) => {
    const users = readUser();
    const newUser = { id: Date.now().toString(), ...data };
    users.push(newUser);
    writeUsers(users);
    return newUser;
  },
  updateUser: async (data: any, id: string) => {
    let users = readUser();
    const index = users.findIndex((u: any) => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...data };
    writeUsers(users);
  },
  deleteUser: async (id: string) => {
    let users = readUser();
    const newUsers = users.filter((u: any) => u.id === id);
    if (newUsers.length === users.length) return false;
    writeUsers(newUsers);
    return true;
  },
  getUserByVerificationOtp: async () => null,
  getUserByResetPasswordOtp: async () => null,
};
