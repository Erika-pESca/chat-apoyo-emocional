import { Injectable } from '@nestjs/common';
import { GeminiService } from './providers/gemini/gemini.service';
import { PromptsService } from './prompts/prompts.service';
import { ResponseValidatorService } from './validators/response-validator.service';

@Injectable()
export class AIService {
  constructor(
    private geminiService: GeminiService,
    private promptsService: PromptsService,
    private responseValidator: ResponseValidatorService,
  ) {}

  /**
   * Genera una respuesta de coaching emocional
   */
  async generateCoachingResponse(params: {
    userMessage: string;
    conversationId: string;
    token: string;
  }): Promise<string> {
    const { userMessage, conversationId, token } = params;

    try {
      // 1. Validar mensaje del usuario
      const userValidation =
        this.responseValidator.validateUserMessage(userMessage);

      if (userValidation.needsEscalation) {
        console.warn('User in crisis:', userValidation.reason);
        return this.responseValidator.getEscalationResponse();
      }

      // 2. Construir prompt completo
      const fullPrompt = await this.promptsService.buildPrompt({
        conversationId,
        userMessage,
        token,
      });

      // 3. Generar respuesta con Gemini
      const rawResponse = await this.geminiService.generate(fullPrompt);

      // 4. Validar respuesta
      const responseValidation = this.responseValidator.validate(rawResponse);

      if (!responseValidation.isValid) {
        console.warn('Invalid AI response:', responseValidation.reason);
        return this.promptsService.getFallbackResponse();
      }

      return rawResponse;
    } catch (error) {
      console.error('Error generating coaching response:', error);
      return this.promptsService.getFallbackResponse();
    }
  }

  /**
   * Genera un resumen de la conversación
   */
  async generateSummary(params: {
    conversationId: string;
    token: string;
  }): Promise<string> {
    // Implementaremos esto en el SummaryModule
    return '';
  }
}