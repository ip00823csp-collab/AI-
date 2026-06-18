export interface RAGResponse {
  retrievedQuestions: {
    question: string;
    category: string;
    source: string;
    difficulty: string;
    relevance: string;
  }[];
  relatedConcepts: string[];
  keywordSuggestions: string[];
  actionItems: string[];
  matchAnalysis: {
    currentKeywords: string[];
    suggestedKeywords: string[];
    gapAreas: string[];
  };
}

export interface RagRequestBody {
  query: string;
  track?: string;
  jd?: string;
}
