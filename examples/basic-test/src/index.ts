import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { auth } from "@sifen/auth";
import { mongooseUserAdapter } from "@sifen/auth-mongoose";
import mongoose from "mongoose";
import connectDb from "./config/mongoose.config";

const app = express();
const userAdapter = mongooseUserAdapter(mongoose);

app.use(express.json());

app.use(
  auth({
    userAdapter,
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiresIn: "15m",
    },
    refreshToken: {
      secret: process.env.REFRESH_SECRET!,
      expiresIn: "7d",
    },
    email: {
      enabled: true,
      from: "no-reply@example.com",
      transport: "console",
    },
  })
);

connectDb(() => {
  app.listen(8000, () => console.log("running on port 8000"));
});
