import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT ?? "4000";

connectDB()
  .then(() => {
    app.listen(Number(PORT), () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error: unknown) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
