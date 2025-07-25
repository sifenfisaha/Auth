import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDb from "./configs/mongodb.config";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ mes: "working" });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

connectDb(() =>
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
);
