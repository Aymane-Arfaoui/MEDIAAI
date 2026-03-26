import type { ChunkMetadata } from "../../types/knowledge.js";

export interface ChunkResult {
  text: string;
  index: number;
  metadata: ChunkMetadata;
}

interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  metadata?: Partial<ChunkMetadata>;
}

/**
 * Split raw text into overlapping chunks suitable for embedding.
 *
 * Default chunk size: ~700 tokens (approx 2800 chars)
 * Default overlap: ~120 tokens (approx 480 chars)
 */
export function chunkText(
  text: string,
  options: ChunkOptions = {}
): ChunkResult[] {
  const {
    chunkSize = 700,
    chunkOverlap = 120,
    metadata = {},
  } = options;

  // Approximate: 1 token ≈ 4 chars
  const charLimit = chunkSize * 4;
  const overlapChars = chunkOverlap * 4;

  const cleaned = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  if (!cleaned) return [];

  // Split on paragraph boundaries first, then fall back to sentence/word
  const paragraphs = cleaned.split(/\n\n+/);
  const chunks: ChunkResult[] = [];
  let currentChunk = "";
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) continue;

    // If adding this paragraph would exceed the limit, finalize current chunk
    if (currentChunk.length + trimmedParagraph.length + 2 > charLimit && currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        index: chunkIndex,
        metadata: {
          ...metadata,
          chunkIndex,
        },
      });
      chunkIndex++;

      // Keep overlap from end of current chunk
      if (overlapChars > 0 && currentChunk.length > overlapChars) {
        currentChunk = currentChunk.slice(-overlapChars);
      } else {
        currentChunk = "";
      }
    }

    // If a single paragraph exceeds the limit, split it further
    if (trimmedParagraph.length > charLimit) {
      const sentences = splitIntoSentences(trimmedParagraph);
      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length + 1 > charLimit && currentChunk.length > 0) {
          chunks.push({
            text: currentChunk.trim(),
            index: chunkIndex,
            metadata: { ...metadata, chunkIndex },
          });
          chunkIndex++;
          currentChunk = currentChunk.length > overlapChars
            ? currentChunk.slice(-overlapChars)
            : "";
        }
        currentChunk += (currentChunk ? " " : "") + sentence;
      }
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + trimmedParagraph;
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push({
      text: currentChunk.trim(),
      index: chunkIndex,
      metadata: { ...metadata, chunkIndex },
    });
  }

  return chunks;
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
}
