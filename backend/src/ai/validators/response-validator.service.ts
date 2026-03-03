import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseValidatorService {
  private readonly inappropriateKeywords = [
    'suicidio',
    'suicidarme',
    'matarme',
    'matar a',
    'violencia extrema',
    'autolesión',
  ];

  private readonly offTopicKeywords = [
    'receta de',
    'cómo cocinar',
    'partido de fútbol',
    'película',
    'serie de tv',
    'videojuego',
  ];

  /**
   * Valida que la respuesta sea apropiada y relevante
   */
  validate(response: string): {
    isValid: boolean;
    reason?: string;
  } {
    const lowerResponse = response.toLowerCase();

    // 1. Validar longitud mínima
    if (response.length < 20) {
      return {
        isValid: false,
        reason: 'Respuesta demasiado corta',
      };
    }

    // 2. Validar longitud máxima
    if (response.length > 5000) {
      return {
        isValid: false,
        reason: 'Respuesta demasiado larga',
      };
    }

    // 3. Validar contenido inapropiado
    for (const keyword of this.inappropriateKeywords) {
      if (lowerResponse.includes(keyword)) {
        return {
          isValid: false,
          reason: 'Contenido potencialmente inapropiado',
        };
      }
    }

    // 4. Detectar si está muy fuera del tema (opcional)
    const offTopicCount = this.offTopicKeywords.filter((keyword) =>
      lowerResponse.includes(keyword),
    ).length;

    if (offTopicCount >= 2) {
      return {
        isValid: false,
        reason: 'Respuesta fuera del tema de coaching',
      };
    }

    return { isValid: true };
  }

  /**
   * Valida que el mensaje del usuario sea apropiado
   */
  validateUserMessage(message: string): {
    isValid: boolean;
    needsEscalation: boolean;
    reason?: string;
  } {
    const lowerMessage = message.toLowerCase();

    // Detectar contenido de crisis
    const crisisKeywords = [
      'quiero morir',
      'voy a suicidarme',
      'quiero matarme',
      'no quiero vivir',
    ];

    for (const keyword of crisisKeywords) {
      if (lowerMessage.includes(keyword)) {
        return {
          isValid: true,
          needsEscalation: true,
          reason: 'Usuario en posible crisis - requiere intervención profesional',
        };
      }
    }

    return {
      isValid: true,
      needsEscalation: false,
    };
  }

  /**
   * Genera respuesta de escalación para casos de crisis
   */
  getEscalationResponse(): string {
    return `Noto que estás pasando por un momento muy difícil. Es importante que sepas que tu bienestar es lo más importante.

Te recomiendo fuertemente que busques apoyo profesional inmediato:
- Línea de prevención del suicidio: 106 (Colombia)
- Servicios de emergencia: 123
- Habla con un profesional de salud mental

Estoy aquí para apoyarte, pero en momentos de crisis es fundamental contar con ayuda profesional especializada. ¿Hay alguien de confianza con quien puedas hablar ahora mismo?`;
  }
}