import express from "express";
import cors from "cors";
import { routes } from "./routes";
import { setupSwagger } from "./swagger";

const app = express();

app.use(cors());
app.use(express.json());

// Configurar Swagger
setupSwagger(app);

app.use(routes);

export { app };
