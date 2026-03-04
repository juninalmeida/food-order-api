import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";
import { ZodError } from "zod";

export function errorHandling(
  error: any,
  request: Request,
  response: Response,
  _: NextFunction,
) {
  const isProduction = (process.env.NODE_ENV ?? "development") === "production";

  if (error instanceof AppError) {
    return response.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof ZodError) {
    return response
      .status(400)
      .json({ message: "validation error", issues: error.format() });
  }

  console.error(`[${request.method}] ${request.originalUrl}`, error);

  if (isProduction) {
    return response.status(500).json({ message: "internal server error" });
  }

  return response.status(500).json({ message: error?.message ?? "unknown error" });
}
