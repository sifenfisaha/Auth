import express from "express";
import dotenv from "dotenv";
import connectDb from "./configs/mongodb.config";
import authRouter from "./routes/auth.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send({ mes: "working" });
});

app.use("/api/auth", authRouter);

connectDb(() =>
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
);
