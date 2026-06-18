export const RAG_CONFIG = {
  INDEX_NAME: "audit-questions",
  CHUNK_SIZE: 512,
  CHUNK_OVERLAP: 50,
  EMBEDDING_MODEL: "text-embedding-ada-002",
  TOP_K_RESULTS: 5,
  MIN_SIMILARITY_THRESHOLD: 0.6,
  EMBEDDING_ENDPOINT: "https://open.bigmodel.cn/api/paas/v4/embeddings",
} as const;
