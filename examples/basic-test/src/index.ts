import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDb from "./config/mongoose.config";
import { auth } from "@sifen/auth";
import { mongooseUserAdapter } from "@sifen/auth-mongoose";
import mongoose from "mongoose";

const app = express();
const userAdapter = mongooseUserAdapter(mongoose);

app.use(express.json());
app.use(auth({ userAdapter: userAdapter }));

connectDb(() => {
  app.listen(8000, () => console.log("surver running on port 8000"));
});
