import { Router } from "express";
import multer from "multer";
import { processUploadedDocument } from "../../services/ingestion/uploads.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "text/csv",
      "application/json",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(pdf|txt|md|csv|json)$/i)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

/**
 * POST /api/ingest/upload
 * Upload a document for knowledge base processing.
 */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const creatorId = req.body.creatorId;

    if (!file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }
    if (!creatorId) {
      return res.status(400).json({ success: false, error: "creatorId is required" });
    }

    const result = await processUploadedDocument(
      creatorId,
      file.originalname,
      file.buffer,
      file.mimetype
    );

    res.json({
      success: true,
      documentId: result.documentId,
      chunks: result.chunks,
      status: result.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ success: false, error: message });
  }
});

export default router;
