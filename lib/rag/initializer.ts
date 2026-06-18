import { vectorStore, type Document } from "./vectorstore";
import { ALL_AUDIT_CONTENT } from "@/data/audit-questions/四大面试题库";

let initialized = false;

export async function initializeVectorStore(): Promise<void> {
  if (initialized) {
    console.log("[VectorStore] Already initialized");
    return;
  }

  console.log(`[VectorStore] Starting initialization with ${ALL_AUDIT_CONTENT.length} documents`);

  try {
    const documents = ALL_AUDIT_CONTENT.map((content, index) => ({
      id: `audit-${index}`,
      ...content,
    }));

    console.log(`[VectorStore] Adding ${documents.length} documents to vector store`);
    await vectorStore.addDocuments(documents);

    initialized = true;
    console.log(`[VectorStore] Initialization complete. Total documents: ${vectorStore.getSize()}`);
  } catch (error) {
    console.error("[VectorStore] Initialization failed:", error);
    throw error;
  }
}

export function isInitialized(): boolean {
  return initialized;
}

export function resetVectorStore(): void {
  vectorStore.clear();
  initialized = false;
  console.log("[VectorStore] Reset complete");
}
