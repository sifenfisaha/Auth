import express from "express";
import { auth } from "@sifen/auth";

const app = express();
const PORT = 5000;

app.use(auth({ devMode: true }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
