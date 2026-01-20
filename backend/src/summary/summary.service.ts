import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from '../ai/providers/gemini/gemini.service';
import { ConversationsService } from '../conversations/conversations.service';
import { MessagesService } from '../messages/messages.service';
import { PromptsService } from '../ai/prompts/prompts.service';

@Injectable()
export class SummaryService {
  private readonly triggerMessageCount: number;

  constructor(
    private configService: ConfigService,
    private geminiService: GeminiService,
    private conversationsService: ConversationsService,
    private messagesService: MessagesService,
    private promptsService: PromptsService,
  ) {
    // Leer cuántos mensajes deben pasar antes de actualizar resumen
    this.triggerMessageCount = parseInt(
      this.configService.get<string>('SUMMARY_TRIGGER_MESSAGE_COUNT') || '10',
      10,
    );
  }

  /**
   * Verifica si necesita actualizar el resumen y lo genera
   */
  async checkAndUpdateSummary(
    conversationId: string,
    token: string,
  ): Promise<void> {
    try {
      // Obtener información de la conversación
      const conversationInfo =
        await this.conversationsService.getConversationWithSummary(
          conversationId,
          token,
        );

      const messageCount = conversationInfo.message_count || 0;

      // Si aún no hay suficientes mensajes, no hacer nada
      if (messageCount < this.triggerMessageCount) {
        return;
      }

      // Si ya existe un resumen, calcular cuántos mensajes nuevos hay
      if (conversationInfo.summary_updated_at) {
        const lastUpdateDate = new Date(conversationInfo.summary_updated_at);
        const newMessagesCount = await this.messagesService.countSinceDate(
          conversationId,
          lastUpdateDate,
          token,
        );

        // Si no hay suficientes mensajes nuevos, no actualizar
        if (newMessagesCount < this.triggerMessageCount) {
          return;
        }
      }

      // Generar y guardar nuevo resumen
      console.log(
        `Generating summary for conversation ${conversationId}...`,
      );
      await this.generateAndSaveSummary(conversationId, token);
    } catch (error) {
      console.error('Error checking/updating summary:', error);
      // No lanzar error para no interrumpir el flujo del chat
    }
  }

  /**
   * Genera un resumen y lo guarda en la base de datos
   */
  private async generateAndSaveSummary(
    conversationId: string,
    token: string,
  ): Promise<void> {
    try {
      // 1. Obtener TODOS los mensajes de la conversación
      const allMessages = await this.messagesService.findByConversation(
        conversationId,
        token,
      );

      if (allMessages.length === 0) {
        console.warn('No messages found for summary');
        return;
      }

      // 2. Construir prompt de resumen
      const summaryPrompt = this.promptsService.buildSummaryPrompt(allMessages);

      // 3. Generar resumen con Gemini
      const summary = await this.geminiService.generate(summaryPrompt);

      // 4. Validar que el resumen no esté vacío
      if (!summary || summary.trim().length === 0) {
        console.error('Generated summary is empty');
        return;
      }

      // 5. Limitar longitud del resumen
      const maxLength = parseInt(
        this.configService.get<string>('SUMMARY_MAX_LENGTH') || '250',
        10,
      );
      const truncatedSummary =
        summary.length > maxLength
          ? summary.substring(0, maxLength) + '...'
          : summary;

      // 6. Guardar en la base de datos
      await this.conversationsService.updateSummary(
        conversationId,
        truncatedSummary,
        token,
      );

      console.log(
        `Summary updated successfully for conversation ${conversationId}`,
      );
    } catch (error) {
      console.error('Error generating/saving summary:', error);
      throw error;
    }
  }

  /**
   * Forzar generación de resumen (útil para testing o manualmente)
   */
  async forceGenerateSummary(
    conversationId: string,
    token: string,
  ): Promise<string> {
    await this.generateAndSaveSummary(conversationId, token);

    const conversationInfo =
      await this.conversationsService.getConversationWithSummary(
        conversationId,
        token,
      );

    return conversationInfo.summary || '';
  }
}