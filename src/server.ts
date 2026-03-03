import express from "express";
import cors, { CorsOptions } from "cors";
import path from "path";

import { routes } from "./routes";
import { errorHandling } from "./middlewares/error-handling";

const PORT = Number(process.env.PORT ?? 3333);
const NODE_ENV = process.env.NODE_ENV ?? "development";

function parseCorsOrigins(envValue: string | undefined): string[] {
  if (!envValue) return [];

  return envValue
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function resolveCorsOptions(): CorsOptions {
  const allowedOrigins = parseCorsOrigins(process.env.CORS_ORIGIN);

  if (allowedOrigins.length === 0) {
    return { origin: true };
  }

  return { origin: allowedOrigins };
}

function buildContentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

const app = express();

app.disable("x-powered-by");

app.use(cors(resolveCorsOptions()));
app.use(express.json({ limit: "16kb" }));

app.use((_request, response, next) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  response.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  response.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  response.setHeader("Content-Security-Policy", buildContentSecurityPolicy());

  if (NODE_ENV === "production") {
    response.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }

  next();
});

app.get("/health", (_, response) => {
  return response.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use(express.static(path.join(__dirname, "..", "public")));

app.use(routes);

app.use(errorHandling);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
