import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send({ mes: "working" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
