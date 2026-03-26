import { Router } from "express";
import { z } from "zod";
import {
  ingestInstagramImport,
  validateImportData,
  parseCsv,
} from "../../services/ingestion/instagramImport.js";

const router = Router();

const importSchema = z.object({
  creatorId: z.string().uuid(),
  data: z.array(z.record(z.unknown())),
  format: z.enum(["json", "csv-parsed"]).optional().default("json"),
});

const validateSchema = z.object({
  data: z.array(z.record(z.unknown())),
});

/**
 * POST /api/ingest/instagram-import
 * Import Instagram posts from CSV/JSON export data.
 */
router.post("/", async (req, res) => {
  try {
    const body = importSchema.parse(req.body);
    const result = await ingestInstagramImport(body.creatorId, body.data);

    res.json({
      success: true,
      ingested: result.ingested,
      skipped: result.skipped,
    });
  } catch (error) {
    const message = error instanceof z.ZodError
      ? error.errors.map((e) => e.message).join(", ")
      : error instanceof Error
        ? error.message
        : "Unknown error";

    res.status(400).json({ success: false, error: message });
  }
});

/**
 * POST /api/ingest/instagram-import/validate
 * Preview and validate import data before importing.
 */
router.post("/validate", async (req, res) => {
  try {
    const body = validateSchema.parse(req.body);
    const result = validateImportData(body.data);

    res.json({
      success: true,
      valid: result.valid,
      errors: result.errors,
      preview: result.preview,
      rowCount: body.data.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ success: false, error: message });
  }
});

/**
 * POST /api/ingest/instagram-import/parse-csv
 * Parse a CSV string into rows for preview/import.
 */
router.post("/parse-csv", async (req, res) => {
  try {
    const { csvContent } = req.body;
    if (!csvContent || typeof csvContent !== "string") {
      return res.status(400).json({ success: false, error: "csvContent is required" });
    }

    const rows = parseCsv(csvContent);
    res.json({
      success: true,
      rows: rows.length,
      data: rows,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ success: false, error: message });
  }
});

export default router;
