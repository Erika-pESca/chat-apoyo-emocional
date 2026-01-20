export interface SentimentResult {
  score: number; // -1 (muy negativo) a 1 (muy positivo)
  label: 'positivo' | 'negativo' | 'neutral';
  emotions: string[]; // ['alegría', 'esperanza', 'tristeza', etc]
  confidence: number; // 0 a 1
}

export interface ISentimentAnalyzer {
  analyze(text: string): Promise<SentimentResult>;
}