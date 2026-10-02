import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { authRouter } from "./routes/auth.js";
import { itemRouter } from "./routes/items.js";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    db: mongoose.connection.readyState === 1,
  });
});

app.use("/api/auth", authRouter);
app.use("/api/items", itemRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `No route for ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
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
