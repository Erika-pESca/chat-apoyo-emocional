import { Injectable } from '@nestjs/common';
import { ConversationsService } from '../../conversations/conversations.service';
import { MessagesService, Message } from '../../messages/messages.service';
import { SYSTEM_PROMPT_COACHING, SUMMARY_PROMPT } from './prompts.constants';

@Injectable()
export class PromptsService {
  constructor(
    private conversationsService: ConversationsService,
    private messagesService: MessagesService,
  ) { }

  /**
   * Construye el prompt completo para Gemini
   */
  async buildPrompt(params: {
    conversationId: string;
    userMessage: string;
    userId: string;
    token: string;
  }): Promise<string> {
    const { conversationId, userMessage, userId, token } = params;

    // 1. Obtener historial global (Memoria Histórica) de todas las sesiones
    const globalContext = await this.conversationsService.getGlobalUserContext(
      userId,
      conversationId,
      token,
    );

    // 2. Obtener información de la conversación actual (resumen actual)
    const conversationInfo =
      await this.conversationsService.getConversationWithSummary(
        conversationId,
        token,
      );

    // 3. Obtener últimos 8 mensajes (Optimizado para tokens)
    const recentMessages = await this.messagesService.findByConversation(
      conversationId,
      token,
      8,
    );

    // Construir el prompt
    let prompt = SYSTEM_PROMPT_COACHING + '\n\n';

    // Inyectar Memoria Histórica (Evolución global)
    if (globalContext) {
      prompt += `## MEMORIA USUARIO:\n${globalContext}\n\n`;
    }

    // Inyectar contexto de la conversación actual (Resumen)
    if (conversationInfo.summary) {
      prompt += `## CONTEXTO ACTUAL:\n${conversationInfo.summary}\n\n`;
    }

    // Agregar historial reciente (Solo los últimos 8 mensajes)
    if (recentMessages.length > 0) {
      prompt += `## HISTORIAL RECIENTE:\n${this.formatMessages(recentMessages)}\n\n`;
    }

    // Agregar mensaje actual
    prompt += `## MENSAJE DEL USUARIO:\n${userMessage}\n\n`;

    prompt += `**Instrucción:** Responde como Coach SerLider. Máximo 2 párrafos breves. Sé empático y desafiante.`;

    return prompt;
  }

  /**
   * Construye el prompt para generar resúmenes
   */
  buildSummaryPrompt(messages: Message[]): string {
    let prompt = SUMMARY_PROMPT + '\n\n';
    prompt += `## Conversación a resumir:\n`;
    prompt += this.formatMessagesForSummary(messages);

    return prompt;
  }

  /**
   * Formatea mensajes para el prompt de conversación
   */
  private formatMessages(messages: Message[]): string {
    return messages
      .map((m) => {
        const role = m.role === 'user' ? 'Usuario' : 'Coach';
        return `${role}: ${m.content}`;
      })
      .join('\n\n');
  }

  /**
   * Formatea mensajes para el prompt de resumen
   */
  private formatMessagesForSummary(messages: Message[]): string {
    return messages
      .map((m, index) => {
        const role = m.role === 'user' ? 'Usuario' : 'Coach';
        return `[Mensaje ${index + 1}] ${role}: ${m.content}`;
      })
      .join('\n\n');
  }

  /**
   * Respuesta de fallback cuando hay error
   */
  getFallbackResponse(): string {
    return 'Entiendo tu mensaje. ¿Podrías contarme un poco más sobre cómo te sientes en este momento? Estoy aquí para escucharte.';
  }
}