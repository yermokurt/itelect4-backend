import "dotenv/config";
import { reviewProject } from "./ai/gemini.js";

const DESCRIPTION =
  "My Campus Lost & Found System is a full-stack web application built with " +
  "React and TypeScript on the frontend, and Express with MongoDB on the backend. " +
  "Students can register and log in using JWT-based authentication. Once logged in, " +
  "they can report lost or found items by providing a title, description, and campus " +
  "location. Each item has a status of LOST, FOUND, or CLAIMED. Users can only view " +
  "and manage their own items. The backend enforces ownership checks so that one " +
  "student cannot access or modify another student's reports. The API includes " +
  "protected CRUD endpoints for items and public endpoints for registration and login. " +
  "The backend is deployed on Vercel as a serverless function, with CORS configured " +
  "to allow only the frontend origin. A health endpoint confirms database connectivity.";

async function main() {
  try {
    const review = await reviewProject(DESCRIPTION);
    console.log(JSON.stringify(review, null, 2));
  } catch (err) {
    console.error("try-ai failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
