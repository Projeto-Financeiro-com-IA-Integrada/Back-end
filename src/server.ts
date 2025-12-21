import "reflect-metadata";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import { initializeRedis } from "./utils/redisRateLimiter";
import { app } from "./app";

dotenv.config();

const PORT = process.env.PORT;

async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log("DB connected");

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