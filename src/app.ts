import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);

export { app };
