export type DocumentType = "pdf" | "txt" | "md" | "transcript" | "csv" | "json";
export type DocumentStatus = "pending" | "parsing" | "chunking" | "embedding" | "ready" | "error";

export type RetrievalScope = "brand" | "transcripts" | "notes" | "strategy" | "mixed";

export interface ChunkMetadata {
  documentName?: string;
  documentType?: string;
  chunkIndex?: number;
  source?: string;
}

export interface RetrievalResult {
  chunkText: string;
  score: number;
  metadata: ChunkMetadata;
}

export interface ComposedContext {
  creatorSummary: string;
  analyticsSummary: string;
  knowledgeSnippets: string[];
  userInstruction: string;
}
