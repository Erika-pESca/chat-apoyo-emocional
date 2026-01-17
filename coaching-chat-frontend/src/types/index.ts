export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  titulo: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  estado_emocional_inicial?: string;
  summary?: string;
  summary_updated_at?: string;
  message_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  sentiment_score?: SentimentScore;
  created_at: string;
}

export interface SentimentScore {
  score: number;
  label: 'positivo' | 'negativo' | 'neutral';
  emotions: string[];
  confidence: number;
}

export interface CreateConversationDto {
  titulo?: string;
  estadoInicial?: string;
}