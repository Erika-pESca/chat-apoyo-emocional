import { Injectable } from '@nestjs/common';
import { GeminiService } from './providers/gemini/gemini.service';
import { PromptsService } from './prompts/prompts.service';
import { ResponseValidatorService } from './validators/response-validator.service';
import { MessagesService } from '../messages/messages.service';

@Injectable()
export class AIService {
  private readonly DAILY_LIMIT = 1450; // Margen de seguridad de 50 sobre 1500

  constructor(
    private geminiService: GeminiService,
    private promptsService: PromptsService,
    private responseValidator: ResponseValidatorService,
    private messagesService: MessagesService,
  ) { }

  /**
   * Verifica si se ha alcanzado el límite diario global
   */
  async isAILimitReached(): Promise<boolean> {
    const count = await this.messagesService.countGlobalAIResponsesToday();
    console.log(`📊 Uso de IA hoy: ${count}/${this.DAILY_LIMIT}`);
    return count >= this.DAILY_LIMIT;
  }

  /**
   * Genera una respuesta de coaching emocional
   */
  async generateCoachingResponse(params: {
    userMessage: string;
    conversationId: string;
    userId: string;
    token: string;
  }): Promise<string> {
    const { userMessage, conversationId, userId, token } = params;

    try {
      // Verificar límite diario antes de proceder
      if (await this.isAILimitReached()) {
        throw new Error('AI_LIMIT_REACHED');
      }

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
        userId,
        token,
      });

      // 🔍 LOG DE DEPURACIÓN: Verificar el prompt
      console.log('=== PROMPT COMPLETO ENVIADO A GEMINI ===');
      console.log('Longitud del prompt:', fullPrompt.length);
      console.log('Primeros 500 caracteres:', fullPrompt.substring(0, 500));
      console.log('=========================================');

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
      // Propagar error de límite para que el gateway lo maneje
      if (error.message === 'AI_LIMIT_REACHED') {
        throw error;
      }
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