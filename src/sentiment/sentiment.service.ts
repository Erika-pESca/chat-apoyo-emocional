import { Injectable } from '@nestjs/common';
import { BasicSentimentAnalyzer } from './analyzers/basic-sentiment.analyzer';
import { SentimentResult } from '../common/interfaces/sentiment-analyzer.interface';

@Injectable()
export class SentimentService {
  constructor(private readonly analyzer: BasicSentimentAnalyzer) {}

  /**
   * Analiza el sentimiento de un texto
   */
  async analyze(text: string): Promise<SentimentResult> {
    if (!text || text.trim().length === 0) {
      return {
        score: 0,
        label: 'neutral',
        emotions: ['neutral'],
        confidence: 0,
      };
    }

    return await this.analyzer.analyze(text);
  }

  /**
   * Obtiene una descripción en texto del sentimiento
   */
  getSentimentDescription(result: SentimentResult): string {
    const emotionsText = result.emotions.join(', ');

    if (result.label === 'positivo') {
      return `Detecté emociones positivas: ${emotionsText}`;
    } else if (result.label === 'negativo') {
      return `Detecté emociones que requieren atención: ${emotionsText}`;
    } else {
      return `Estado emocional neutral`;
    }
  }

  /**
   * Determina si el usuario necesita apoyo urgente
   */
  needsUrgentSupport(result: SentimentResult): boolean {
    // Si detecta emociones muy negativas con alta confianza
    const criticalEmotions = [
      'desesperanza',
      'desesperación',
      'agotamiento',
    ];
    const hasCriticalEmotion = result.emotions.some((emotion) =>
      criticalEmotions.includes(emotion),
    );

    return (
      hasCriticalEmotion && result.confidence > 0.7 && result.score < -0.5
    );
  }
}