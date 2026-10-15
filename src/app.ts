import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { authRouter } from "./routes/auth.js";
import { itemRouter } from "./routes/items.js";

const app = express();

const rawOrigins = process.env.CORS_ORIGIN ?? "http://localhost:5173";
const allowedOrigins = rawOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(requestOrigin, callback) {
      if (!requestOrigin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin '${requestOrigin}' is not allowed by CORS`));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.use(async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection failed");
    res.status(503).json({ message: "Database unavailable" });
  }
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    db: mongoose.connection.readyState === 1,
  });
});

app.use("/api/auth", authRouter);
app.use("/api/items", itemRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `No route for ${req.method} ${req.originalUrl}`,
  });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (
    err instanceof Error &&
    err.name === "ValidationError" &&
    "errors" in err
  ) {
    const validationErr = err as mongoose.Error.ValidationError;
    const errors = Object.values(validationErr.errors).map((e) => e.message);
    res.status(400).json({ message: "Validation failed", errors });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: `Invalid value for field: ${err.path}` });
    return;
  }

  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

export default app;
