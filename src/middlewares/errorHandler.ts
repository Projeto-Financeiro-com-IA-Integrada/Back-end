import { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/error/AppError";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("[ERROR]", err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      timestamp: err.timestamp,
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: "Erro interno do servidor",
    timestamp: new Date(),
  });
};
