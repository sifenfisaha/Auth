import { getUserModel } from "../models/user.model";
import type { Iuser } from "../types/types";
import type { UserAdapter } from "../types/types";
import mongoose from "mongoose";

export const mongooseUserAdapter = (
  mongooseInstance: typeof mongoose
): UserAdapter<Iuser> => {
  const User = getUserModel(mongooseInstance);

  return {
    async getUserById(id: string): Promise<Iuser | null> {
      return User.findById(id).lean<Iuser>().exec();
    },

    async getUserByEmail(email: string): Promise<Iuser | null> {
      return User.findOne({ email }).lean<Iuser>().exec();
    },

    async createUser(data: Partial<Iuser>): Promise<Iuser> {
      const user = new User(data);
      return user.save();
    },

    async updateUser(id: string, data: Partial<Iuser>): Promise<Iuser | null> {
      return User.findByIdAndUpdate(id, data, { new: true })
        .lean<Iuser>()
        .exec();
    },

    async deleteUser(id: string): Promise<boolean> {
      const res = await User.findByIdAndDelete(id).exec();
      return res !== null;
    },
  };
};
