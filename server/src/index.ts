import "dotenv/config";
import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error-handler.js";

// Route imports
import youtubeRouter from "./routes/ingest/youtube.js";
import instagramImportRouter from "./routes/ingest/instagramImport.js";
import uploadRouter from "./routes/ingest/upload.js";
import analyticsRouter from "./routes/analytics.js";
import ragRouter from "./routes/rag.js";
import strategyRouter from "./routes/strategy.js";
import plannerRouter from "./routes/planner.js";
import chatRouter from "./routes/chat.js";
import creatorsRouter from "./routes/creators.js";
import knowledgeRouter from "./routes/knowledge.js";
import repurposeRouter from "./routes/repurpose.js";

const app = express();
const PORT = parseInt(process.env.PORT ?? "3001", 10);

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173" }));
app.use(express.json({ limit: "50mb" }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "mediaai-server" });
});

// API routes
app.use("/api/ingest/youtube", youtubeRouter);
app.use("/api/ingest/instagram-import", instagramImportRouter);
app.use("/api/ingest/upload", uploadRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/rag", ragRouter);
app.use("/api/strategy", strategyRouter);
app.use("/api/planner", plannerRouter);
app.use("/api/chat", chatRouter);
app.use("/api/creators", creatorsRouter);
app.use("/api/knowledge", knowledgeRouter);
app.use("/api/repurpose", repurposeRouter);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n  MEDIAAI Server running on http://localhost:${PORT}`);
  console.log(`  API endpoints available at http://localhost:${PORT}/api\n`);
});

export default app;
