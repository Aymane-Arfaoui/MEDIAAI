import { eq } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { knowledgeDocuments } from "../../db/schema.js";
import { chunkText } from "../rag/chunk.js";
import { embedAndStoreChunks } from "../rag/embed.js";
import type { DocumentType, DocumentStatus } from "../../types/knowledge.js";

/**
 * Process an uploaded document: extract text, chunk, embed, store.
 */
export async function processUploadedDocument(
  creatorId: string,
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<{ documentId: string; chunks: number; status: DocumentStatus }> {
  const docType = inferDocumentType(fileName, mimeType);
  const rawText = await extractText(fileBuffer, docType);

  // Store document record
  const [doc] = await db
    .insert(knowledgeDocuments)
    .values({
      creatorId,
      name: fileName,
      type: docType,
      source: "upload",
      rawText,
      status: "chunking",
      metadataJson: { mimeType, sizeBytes: fileBuffer.length },
    })
    .returning();

  try {
    // Chunk the text
    const chunks = chunkText(rawText, {
      chunkSize: 700,
      chunkOverlap: 120,
      metadata: { documentName: fileName, documentType: docType },
    });

    // Embed and store chunks
    await embedAndStoreChunks(creatorId, doc.id, chunks);

    await db
      .update(knowledgeDocuments)
      .set({ status: "ready" })
      .where(eq(knowledgeDocuments.id, doc.id));

    return { documentId: doc.id, chunks: chunks.length, status: "ready" };
  } catch (error) {
    await db
      .update(knowledgeDocuments)
      .set({ status: "error" })
      .where(eq(knowledgeDocuments.id, doc.id));

    throw error;
  }
}

/**
 * Extract raw text from a file buffer based on document type.
 */
async function extractText(buffer: Buffer, docType: DocumentType): Promise<string> {
  switch (docType) {
    case "pdf": {
      const pdfParse = (await import("pdf-parse")).default;
      const result = await pdfParse(buffer);
      return result.text;
    }
    case "txt":
    case "md":
    case "transcript":
      return buffer.toString("utf-8");
    case "csv":
    case "json":
      return buffer.toString("utf-8");
    default:
      return buffer.toString("utf-8");
  }
}

/**
 * Infer document type from filename and mime type.
 */
function inferDocumentType(fileName: string, mimeType: string): DocumentType {
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (ext === "pdf" || mimeType === "application/pdf") return "pdf";
  if (ext === "md") return "md";
  if (ext === "csv" || mimeType === "text/csv") return "csv";
  if (ext === "json" || mimeType === "application/json") return "json";
  if (ext === "txt" || mimeType === "text/plain") return "txt";

  if (
    fileName.toLowerCase().includes("transcript") ||
    fileName.toLowerCase().includes("script")
  ) {
    return "transcript";
  }

  return "txt";
}
