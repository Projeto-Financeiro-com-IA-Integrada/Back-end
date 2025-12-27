import express from "express";
import cors from "cors";
import { routes } from "./routes";
import { setupSwagger } from "./swagger";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

setupSwagger(app);

app.use(routes);

app.use(errorHandler);

export { app };
