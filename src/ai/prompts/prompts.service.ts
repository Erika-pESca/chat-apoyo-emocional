import { Injectable } from '@nestjs/common';
import { ConversationsService } from '../../conversations/conversations.service';
import { MessagesService, Message } from '../../messages/messages.service';
import { SYSTEM_PROMPT_COACHING, SUMMARY_PROMPT } from './prompts.constants';

@Injectable()
export class PromptsService {
  constructor(
    private conversationsService: ConversationsService,
    private messagesService: MessagesService,
  ) {}

  /**
   * Construye el prompt completo para Gemini
   */
  async buildPrompt(params: {
    conversationId: string;
    userMessage: string;
    token: string;
  }): Promise<string> {
    const { conversationId, userMessage, token } = params;

    // Obtener información de la conversación (resumen)
    const conversationInfo =
      await this.conversationsService.getConversationWithSummary(
        conversationId,
        token,
      );

    // Obtener últimos 15 mensajes
    const recentMessages = await this.messagesService.findByConversation(
      conversationId,
      token,
      15,
    );

    // Construir el prompt
    let prompt = SYSTEM_PROMPT_COACHING + '\n\n';

    // Agregar resumen si existe
    if (conversationInfo.summary) {
      prompt += `## Contexto previo de la conversación:\n`;
      prompt += `${conversationInfo.summary}\n\n`;
    }

    // Agregar historial reciente
    if (recentMessages.length > 0) {
      prompt += `## Historial reciente de la conversación:\n`;
      prompt += this.formatMessages(recentMessages) + '\n\n';
    }

    // Agregar mensaje actual
    prompt += `## Mensaje actual del usuario:\n`;
    prompt += `${userMessage}\n\n`;

    prompt += `Responde como coach emocional, enfocado en el bienestar del usuario. Sé empático, profesional y conciso.`;

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