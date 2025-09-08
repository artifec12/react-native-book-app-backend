import express from "express";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import { dbConnect } from "./lib/db.js";
import cors from "cors";
import job from "./lib/cron.js";
const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());

job.start();

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  dbConnect();
});
