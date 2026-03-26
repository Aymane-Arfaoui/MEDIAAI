import OpenAI from "openai";
import { db } from "../../db/connection.js";
import { knowledgeChunks } from "../../db/schema.js";
import type { ChunkResult } from "./chunk.js";

const EMBEDDING_MODEL = "text-embedding-3-small";
const BATCH_SIZE = 20;

let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

/**
 * Generate embeddings for an array of text strings.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const client = getOpenAI();
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });

    for (const item of response.data) {
      results.push(item.embedding);
    }
  }

  return results;
}

/**
 * Generate a single embedding for a text string.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const [embedding] = await generateEmbeddings([text]);
  return embedding;
}

/**
 * Embed chunks and store them in the database.
 */
export async function embedAndStoreChunks(
  creatorId: string,
  documentId: string,
  chunks: ChunkResult[]
): Promise<number> {
  if (chunks.length === 0) return 0;

  const texts = chunks.map((c) => c.text);
  const embeddings = await generateEmbeddings(texts);

  const records = chunks.map((chunk, i) => ({
    creatorId,
    documentId,
    chunkText: chunk.text,
    embedding: embeddings[i],
    chunkIndex: chunk.index,
    metadataJson: chunk.metadata,
  }));

  await db.insert(knowledgeChunks).values(records);

  return records.length;
}
