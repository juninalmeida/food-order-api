import { NextFunction, Request, Response } from "express";

type RateBucket = {
  count: number;
  resetAt: number;
};

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 60;

const configuredWindowMs = Number(process.env.WRITE_RATE_LIMIT_WINDOW_MS);
const configuredMaxRequests = Number(process.env.WRITE_RATE_LIMIT_MAX);

const WINDOW_MS =
  Number.isFinite(configuredWindowMs) && configuredWindowMs > 0
    ? configuredWindowMs
    : DEFAULT_WINDOW_MS;

const MAX_REQUESTS =
  Number.isFinite(configuredMaxRequests) && configuredMaxRequests > 0
    ? configuredMaxRequests
    : DEFAULT_MAX_REQUESTS;

const buckets = new Map<string, RateBucket>();

function getClientId(request: Request): string {
  return request.ip || request.socket.remoteAddress || "unknown";
}

export function writeRateLimit(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const now = Date.now();
  const clientId = getClientId(request);
  const currentBucket = buckets.get(clientId);

  if (!currentBucket || currentBucket.resetAt <= now) {
    buckets.set(clientId, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (currentBucket.count >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((currentBucket.resetAt - now) / 1000),
    );

    response.setHeader("Retry-After", String(retryAfterSeconds));

    return response
      .status(429)
      .json({ message: "too many write requests, try again later" });
  }

  currentBucket.count += 1;
  return next();
}
