const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  [key: string]: unknown;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await res.json();

    if (!res.ok || data.success === false) {
      throw new Error(data.error ?? `API error: ${res.status}`);
    }

    return data as T;
  }

  // ─── Creators ──────────────────────────────────────────────────

  async getCreators() {
    return this.request<{ success: boolean; creators: any[] }>("/creators");
  }

  async getCreator(id: string) {
    return this.request<{ success: boolean; creator: any }>(`/creators/${id}`);
  }

  // ─── Ingestion ─────────────────────────────────────────────────

  async ingestYouTube(creatorId: string, url: string, maxResults?: number) {
    return this.request<{
      success: boolean;
      ingested: number;
      videos: any[];
    }>("/ingest/youtube", {
      method: "POST",
      body: JSON.stringify({ creatorId, url, maxResults }),
    });
  }

  async ingestInstagramImport(creatorId: string, data: Record<string, unknown>[]) {
    return this.request<{
      success: boolean;
      ingested: number;
      skipped: number;
    }>("/ingest/instagram-import", {
      method: "POST",
      body: JSON.stringify({ creatorId, data }),
    });
  }

  async validateInstagramImport(data: Record<string, unknown>[]) {
    return this.request<{
      success: boolean;
      valid: boolean;
      errors: string[];
      preview: any[];
      rowCount: number;
    }>("/ingest/instagram-import/validate", {
      method: "POST",
      body: JSON.stringify({ data }),
    });
  }

  async uploadDocument(creatorId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("creatorId", creatorId);

    const url = `${this.baseUrl}/ingest/upload`;
    const res = await fetch(url, { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok || data.success === false) {
      throw new Error(data.error ?? `Upload failed: ${res.status}`);
    }

    return data as { success: boolean; documentId: string; chunks: number; status: string };
  }

  // ─── Knowledge ─────────────────────────────────────────────────

  async getKnowledgeDocuments(creatorId: string) {
    return this.request<{
      success: boolean;
      documents: any[];
    }>(`/knowledge/${creatorId}`);
  }

  async deleteKnowledgeDocument(documentId: string) {
    return this.request<{ success: boolean; deleted: string }>(
      `/knowledge/document/${documentId}`,
      { method: "DELETE" }
    );
  }

  // ─── Analytics ─────────────────────────────────────────────────

  async runAnalytics(creatorId: string) {
    return this.request<{
      success: boolean;
      processed: number;
      summaries: any[];
    }>("/analytics/run", {
      method: "POST",
      body: JSON.stringify({ creatorId }),
    });
  }

  async getAnalytics(creatorId: string) {
    return this.request<{
      success: boolean;
      analytics: any;
    }>(`/analytics/${creatorId}`);
  }

  // ─── RAG ───────────────────────────────────────────────────────

  async queryKnowledge(
    creatorId: string,
    query: string,
    scope?: string,
    topK?: number
  ) {
    return this.request<{
      success: boolean;
      results: { text: string; score: number; metadata: any }[];
    }>("/rag/query", {
      method: "POST",
      body: JSON.stringify({ creatorId, query, scope, topK }),
    });
  }

  // ─── Strategy ──────────────────────────────────────────────────

  async generateStrategy(creatorId: string, instruction?: string) {
    return this.request<{
      success: boolean;
      strategy: any;
    }>("/strategy/generate", {
      method: "POST",
      body: JSON.stringify({ creatorId, instruction }),
    });
  }

  // ─── Planner ───────────────────────────────────────────────────

  async generatePlan(creatorId: string, startDate: string, instruction?: string) {
    return this.request<{
      success: boolean;
      plan: any;
    }>("/planner/generate", {
      method: "POST",
      body: JSON.stringify({ creatorId, startDate, instruction }),
    });
  }

  async getPlan(planId: string) {
    return this.request<{ success: boolean; plan: any }>(`/planner/${planId}`);
  }

  // ─── Chat ──────────────────────────────────────────────────────

  async sendMessage(creatorId: string, message: string, sessionId?: string) {
    return this.request<{
      success: boolean;
      sessionId: string;
      response: string;
      messageId: string;
    }>("/chat", {
      method: "POST",
      body: JSON.stringify({ creatorId, message, sessionId }),
    });
  }

  async getChatHistory(sessionId: string) {
    return this.request<{
      success: boolean;
      messages: any[];
    }>(`/chat/history/${sessionId}`);
  }

  async getChatSessions(creatorId: string) {
    return this.request<{
      success: boolean;
      sessions: any[];
    }>(`/chat/sessions/${creatorId}`);
  }

  // ─── Repurpose ────────────────────────────────────────────────

  async selectTopVideos(creatorId: string, count: number = 2) {
    return this.request<{
      success: boolean;
      count: number;
      videos: any[];
    }>("/repurpose/select-top-videos", {
      method: "POST",
      body: JSON.stringify({ creatorId, count }),
    });
  }

  async downloadVideo(contentItemId: string, url: string) {
    return this.request<{
      success: boolean;
      asset: any;
      cached: boolean;
    }>("/repurpose/download", {
      method: "POST",
      body: JSON.stringify({ contentItemId, url }),
    });
  }

  async analyzeForRepurpose(creatorId: string, video: any) {
    return this.request<{
      success: boolean;
      analysis: any;
    }>("/repurpose/analyze", {
      method: "POST",
      body: JSON.stringify({ creatorId, video }),
    });
  }

  async generateRepurposePlan(creatorId: string, video: any, analysis: any) {
    return this.request<{
      success: boolean;
      plan: any;
    }>("/repurpose/generate", {
      method: "POST",
      body: JSON.stringify({ creatorId, video, analysis }),
    });
  }

  async renderOverlay(
    contentItemId: string,
    hookText?: string,
    headlineText?: string,
    subtitleText?: string
  ) {
    return this.request<{
      success: boolean;
      rendered: any;
    }>("/repurpose/render", {
      method: "POST",
      body: JSON.stringify({ contentItemId, hookText, headlineText, subtitleText }),
    });
  }

  async generateVoiceover(
    contentItemId: string,
    scriptText: string,
    withVideo: boolean = false,
    voice?: string
  ) {
    return this.request<{
      success: boolean;
      asset: any;
    }>("/repurpose/voiceover", {
      method: "POST",
      body: JSON.stringify({ contentItemId, scriptText, withVideo, voice }),
    });
  }

  getDownloadFileUrl(filename: string) {
    return `${this.baseUrl}/repurpose/download-file/${filename}`;
  }

  // ─── Health ────────────────────────────────────────────────────

  async healthCheck() {
    return this.request<{ status: string; service: string }>("/health");
  }
}

export const api = new ApiClient(API_BASE);
