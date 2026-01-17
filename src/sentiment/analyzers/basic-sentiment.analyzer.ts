import { Injectable } from '@nestjs/common';
import {
  ISentimentAnalyzer,
  SentimentResult,
} from '../../common/interfaces/sentiment-analyzer.interface';

@Injectable()
export class BasicSentimentAnalyzer implements ISentimentAnalyzer {
  private readonly positiveKeywords = [
    'feliz',
    'alegre',
    'contento',
    'motivado',
    'bien',
    'genial',
    'excelente',
    'fantástico',
    'optimista',
    'agradecido',
    'esperanzado',
    'satisfecho',
    'entusiasmado',
    'tranquilo',
    'relajado',
  ];

  private readonly negativeKeywords = [
    'triste',
    'deprimido',
    'ansioso',
    'estresado',
    'preocupado',
    'mal',
    'terrible',
    'horrible',
    'frustrado',
    'enojado',
    'molesto',
    'cansado',
    'agotado',
    'abrumado',
    'desesperado',
  ];

  private readonly emotionMap = {
    // Positivas
    feliz: 'alegría',
    alegre: 'alegría',
    contento: 'satisfacción',
    motivado: 'motivación',
    optimista: 'esperanza',
    agradecido: 'gratitud',
    entusiasmado: 'entusiasmo',
    tranquilo: 'calma',
    relajado: 'calma',
    // Negativas
    triste: 'tristeza',
    deprimido: 'tristeza',
    ansioso: 'ansiedad',
    estresado: 'estrés',
    preocupado: 'preocupación',
    frustrado: 'frustración',
    enojado: 'enojo',
    molesto: 'irritación',
    cansado: 'fatiga',
    agotado: 'agotamiento',
    abrumado: 'sobrecarga',
    desesperado: 'desesperanza',
  };

  async analyze(text: string): Promise<SentimentResult> {
    const normalizedText = text.toLowerCase();

    let positiveCount = 0;
    let negativeCount = 0;
    const detectedEmotions: string[] = [];

    // Contar palabras positivas
    this.positiveKeywords.forEach((keyword) => {
      if (normalizedText.includes(keyword)) {
        positiveCount++;
        const emotion = this.emotionMap[keyword];
        if (emotion && !detectedEmotions.includes(emotion)) {
          detectedEmotions.push(emotion);
        }
      }
    });

    // Contar palabras negativas
    this.negativeKeywords.forEach((keyword) => {
      if (normalizedText.includes(keyword)) {
        negativeCount++;
        const emotion = this.emotionMap[keyword];
        if (emotion && !detectedEmotions.includes(emotion)) {
          detectedEmotions.push(emotion);
        }
      }
    });

    // Calcular score (-1 a 1)
    const totalWords = positiveCount + negativeCount;
    let score = 0;

    if (totalWords > 0) {
      score = (positiveCount - negativeCount) / totalWords;
    }

    // Determinar label
    let label: 'positivo' | 'negativo' | 'neutral';
    if (score > 0.2) {
      label = 'positivo';
    } else if (score < -0.2) {
      label = 'negativo';
    } else {
      label = 'neutral';
    }

    // Calcular confianza (basado en cantidad de palabras emocionales encontradas)
    const confidence = Math.min(totalWords / 3, 1); // Max confianza con 3+ palabras

    return {
      score,
      label,
      emotions: detectedEmotions.length > 0 ? detectedEmotions : ['neutral'],
      confidence,
    };
  }
}