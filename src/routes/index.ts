import { Router } from "express";
import { authRouter } from "./auth";
import { profileRouter } from "./profile";
import { transactionsRouter } from "./transactions";

const routes = Router();

routes.use("/auth", authRouter);
routes.use("/user", profileRouter);
routes.use("/transactions", transactionsRouter);

export { routes };
