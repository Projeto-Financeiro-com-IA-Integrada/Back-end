import "reflect-metadata";
import { DataSource, Transaction } from "typeorm";
import { User } from "./modules/user/entities/User";
import dotenv from "dotenv";
import { Category } from "./modules/financial/entities/Category";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true, // depois trocamos para migrações
  logging: false,
  entities: [User, Category, Transaction],
});
