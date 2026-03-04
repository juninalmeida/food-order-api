import { NextFunction, Request, Response } from "express";

function extractApiKey(request: Request): string | undefined {
  const keyByHeader = request.header("x-api-key");
  if (keyByHeader) return keyByHeader;

  const authorization = request.header("authorization");
  if (!authorization) return undefined;

  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return undefined;

  return token;
}

export function requireAdminApiKey(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  const expectedApiKey = process.env.ADMIN_API_KEY;

  if (!expectedApiKey) {
    if (nodeEnv !== "production") {
      return next();
    }

    return response
      .status(503)
      .json({ message: "admin api key is not configured" });
  }

  const providedApiKey = extractApiKey(request);

  if (!providedApiKey || providedApiKey !== expectedApiKey) {
    return response.status(401).json({ message: "unauthorized" });
  }

  return next();
}
