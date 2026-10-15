import app from "./app.js";

const PORT = process.env.PORT ?? "4000";

app.listen(Number(PORT), () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
