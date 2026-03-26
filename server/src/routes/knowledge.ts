import { Router } from "express";
import { db } from "../db/connection.js";
import { knowledgeDocuments, knowledgeChunks } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

const router = Router();

/**
 * GET /api/knowledge/:creatorId
 * List all knowledge documents for a creator.
 */
router.get("/:creatorId", async (req, res) => {
  try {
    const docs = await db
      .select({
        id: knowledgeDocuments.id,
        name: knowledgeDocuments.name,
        type: knowledgeDocuments.type,
        source: knowledgeDocuments.source,
        status: knowledgeDocuments.status,
        metadataJson: knowledgeDocuments.metadataJson,
        createdAt: knowledgeDocuments.createdAt,
        chunkCount: sql<number>`(
          SELECT COUNT(*) FROM ${knowledgeChunks}
          WHERE ${knowledgeChunks.documentId} = ${knowledgeDocuments.id}
        )`.as("chunk_count"),
      })
      .from(knowledgeDocuments)
      .where(eq(knowledgeDocuments.creatorId, req.params.creatorId));

    res.json({ success: true, documents: docs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ success: false, error: message });
  }
});

/**
 * DELETE /api/knowledge/document/:documentId
 * Delete a knowledge document and its chunks.
 */
router.delete("/document/:documentId", async (req, res) => {
  try {
    const { documentId } = req.params;

    await db.delete(knowledgeChunks).where(eq(knowledgeChunks.documentId, documentId));
    await db.delete(knowledgeDocuments).where(eq(knowledgeDocuments.id, documentId));

    res.json({ success: true, deleted: documentId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ success: false, error: message });
  }
});

export default router;
