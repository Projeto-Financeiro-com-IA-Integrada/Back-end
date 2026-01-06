import { Router } from "express";
import { authRouter } from "./auth";
import { profileRouter } from "./profile";
import { transactionsRouter } from "./transactions";
import { categoriesRouter } from "./categories";
import { aiRouter } from "./ai"; 

const routes = Router();

routes.use("/auth", authRouter);
routes.use("/user", profileRouter);
routes.use("/categories", categoriesRouter);
routes.use("/transactions", transactionsRouter);
routes.use("/ai", aiRouter);

export { routes };
