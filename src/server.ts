import "reflect-metadata";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import { initializeRedis } from "./shared/utils/redisRateLimiter";
import { app } from "./app";
import { categoriesSeed } from "./database/seeds/CategorySeed";

dotenv.config();

const PORT = process.env.PORT;

async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log("DB connected");

        // Executar seeds
    await categoriesSeed(AppDataSource);

    await initializeRedis();
    console.log("Redis connected");
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error during server initialization", err);
    process.exit(1);
  }
}

startServer();