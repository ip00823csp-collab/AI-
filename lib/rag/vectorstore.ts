import { RAG_CONFIG } from "./config";

export interface Document {
  id: string;
  content: string;
  metadata: {
    type: "question" | "answer" | "case" | "framework" | "technical";
    category: string;
    source: "PwC" | "Deloitte" | "EY" | "KPMG";
    difficulty?: "初级" | "中级" | "高级";
    year?: number;
  };
}

export interface QueryResult {
  document: Document;
  score: number;
  relevanceText: string;
}

class VectorStore {
  private documents: Document[] = [];
  private embeddings: Map<string, number[]>;

  constructor() {
    this.embeddings = new Map();
  }

  async addDocument(doc: Document) {
    const embedding = await this.embedDocument(doc.content);
    this.documents.push(doc);
    this.embeddings.set(doc.id, embedding);
    return doc.id;
  }

  async addDocuments(docs: Document[]) {
    for (const doc of docs) {
      await this.addDocument(doc);
    }
  }

  async query(query: string, topK: number = RAG_CONFIG.TOP_K_RESULTS): Promise<QueryResult[]> {
    const queryEmbedding = await this.embedDocument(query);
    const results: QueryResult[] = [];

    for (const doc of this.documents) {
      const docEmbedding = this.embeddings.get(doc.id);
      if (!docEmbedding) continue;

      const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding);
      if (similarity >= RAG_CONFIG.MIN_SIMILARITY_THRESHOLD) {
        results.push({
          document: doc,
          score: similarity,
          relevanceText: this.generateRelevanceText(query, doc.content),
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  private async embedDocument(text: string): Promise<number[]> {
    const apiKey = process.env.GLM_API_KEY;
    if (!apiKey) {
      throw new Error("GLM_API_KEY 环境变量未设置");
    }

    const response = await fetch(RAG_CONFIG.EMBEDDING_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: RAG_CONFIG.EMBEDDING_MODEL,
        input: text,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Embedding API 错误 (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private generateRelevanceText(query: string, content: string): string {
    const queryWords = new Set(query.split(/\s+/).filter(w => w.length > 3).map(w => w.toLowerCase()));
    const contentLower = content.toLowerCase();
    const matchedWords = Array.from(queryWords).filter(word => contentLower.includes(word));

    if (matchedWords.length > 0) {
      return `匹配关键词: ${matchedWords.slice(0, 5).join(", ")}`;
    }

    return "语义匹配 - 关键词无明显重叠";
  }

  getDocuments(): Document[] {
    return [...this.documents];
  }

  clear() {
    this.documents = [];
    this.embeddings.clear();
  }

  getSize(): number {
    return this.documents.length;
  }
}

export const vectorStore = new VectorStore();
