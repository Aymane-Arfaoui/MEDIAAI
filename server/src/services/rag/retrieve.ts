import { db } from "../../db/connection.js";
import { knowledgeChunks, knowledgeDocuments } from "../../db/schema.js";
import { eq, sql, and } from "drizzle-orm";
import { generateEmbedding } from "./embed.js";
import type { RetrievalResult, RetrievalScope } from "../../types/knowledge.js";

/**
 * Retrieve the most relevant knowledge chunks for a query.
 */
export async function retrieveRelevantChunks(
  creatorId: string,
  query: string,
  options: {
    scope?: RetrievalScope;
    topK?: number;
    minScore?: number;
  } = {}
): Promise<RetrievalResult[]> {
  const { scope = "mixed", topK = 8, minScore = 0.3 } = options;

  const queryEmbedding = await generateEmbedding(query);
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  // Build scope filter using document type joins
  let scopeFilter: ReturnType<typeof eq> | undefined;
  if (scope !== "mixed") {
    const typeMap: Record<string, string[]> = {
      brand: ["pdf"],
      transcripts: ["transcript"],
      notes: ["txt", "md"],
      strategy: ["pdf", "txt", "md"],
    };
    const types = typeMap[scope];
    if (types && types.length > 0) {
      // Filter by joining to knowledgeDocuments
      scopeFilter = sql`${knowledgeChunks.documentId} IN (
        SELECT id FROM ${knowledgeDocuments}
        WHERE ${knowledgeDocuments.type} = ANY(ARRAY[${sql.raw(types.map((t) => `'${t}'`).join(","))}])
      )`;
    }
  }

  const conditions = [eq(knowledgeChunks.creatorId, creatorId)];
  if (scopeFilter) {
    conditions.push(scopeFilter as any);
  }

  const results = await db
    .select({
      chunkText: knowledgeChunks.chunkText,
      metadata: knowledgeChunks.metadataJson,
      score: sql<number>`1 - (${knowledgeChunks.embedding} <=> ${embeddingStr}::vector)`.as(
        "similarity"
      ),
    })
    .from(knowledgeChunks)
    .where(and(...conditions))
    .orderBy(sql`${knowledgeChunks.embedding} <=> ${embeddingStr}::vector`)
    .limit(topK);

  return results
    .filter((r) => r.score >= minScore)
    .map((r) => ({
      chunkText: r.chunkText,
      score: r.score,
      metadata: (r.metadata as any) ?? {},
    }));
}
