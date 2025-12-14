import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

export const validateBody =
  (schema: ZodType <any, any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Corpo da requisição inválido",
        errors: result.error.issues, // lista de erros com path, message, etc.
      });
    }

    req.body = result.data;
    next();
  };
