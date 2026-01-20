import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsSupabaseAuthGuard } from '../auth/guards/ws-supabase-auth.guard';
import { MessagesService } from '../messages/messages.service';
import { ConversationsService } from '../conversations/conversations.service';
import { AIService } from '../ai/ai.service';
import { SentimentService } from '../sentiment/sentiment.service';
import { SummaryService } from '../summary/summary.service';

interface SendMessagePayload {
  conversationId: string;
  message: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/ws',
})
@UseGuards(WsSupabaseAuthGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private messagesService: MessagesService,
    private conversationsService: ConversationsService,
    private aiService: AIService,
    private sentimentService: SentimentService,
    private summaryService: SummaryService,
  ) {}

  /**
   * Cuando un usuario se conecta al WebSocket
   */
  async handleConnection(client: Socket) {
    const user = client.data.user;
    console.log(`✅ Usuario conectado: ${user.email} (${user.id})`);

    // Unir al usuario a su "room" personal
    client.join(`user:${user.id}`);

    // Enviar confirmación de conexión
    client.emit('connected', {
      message: 'Conectado exitosamente',
      userId: user.id,
    });
  }

  /**
   * Cuando un usuario se desconecta
   */
  handleDisconnect(client: Socket) {
    const user = client.data.user;
    console.log(`❌ Usuario desconectado: ${user?.email || 'Unknown'}`);
  }

  /**
   * Evento principal: enviar mensaje
   */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessagePayload,
  ) {
    const userId = client.data.userId;
    const token = client.data.token;
    const { conversationId, message } = payload;

    try {
      console.log(`📨 Mensaje recibido de ${userId}: "${message}"`);

      // 1. Validar que la conversación pertenece al usuario
      const conversation = await this.conversationsService.findOne(
        conversationId,
        userId,
        token,
      );

      if (!conversation) {
        client.emit('error', { message: 'Conversación no encontrada' });
        return;
      }

      // 2. Analizar sentimiento del mensaje del usuario
      const sentiment = await this.sentimentService.analyze(message);

      console.log(
        `🎭 Sentimiento: ${sentiment.label} (${sentiment.emotions.join(', ')})`,
      );

      // 3. Guardar mensaje del usuario
      const userMessage = await this.messagesService.create(
        {
          conversationId,
          role: 'user',
          content: message,
          sentimentScore: sentiment,
        },
        token,
      );

      // 4. Emitir el mensaje del usuario al cliente (confirmación)
      client.emit('message_received', {
        id: userMessage.id,
        role: 'user',
        content: message,
        sentiment,
        createdAt: userMessage.created_at,
      });

      // 5. Indicar que la IA está "escribiendo"
      client.emit('ai_typing', { conversationId, isTyping: true });

      // 6. Generar respuesta de la IA
      console.log(`🤖 Generando respuesta de IA...`);
      const aiResponse = await this.aiService.generateCoachingResponse({
        userMessage: message,
        conversationId,
        token,
      });

      console.log(`✅ Respuesta generada: "${aiResponse.substring(0, 50)}..."`);

      // 7. Guardar respuesta del assistant
      const assistantMessage = await this.messagesService.create(
        {
          conversationId,
          role: 'assistant',
          content: aiResponse,
        },
        token,
      );

      // 8. Detener indicador de "escribiendo"
      client.emit('ai_typing', { conversationId, isTyping: false });

      // 9. Emitir respuesta de la IA al cliente
      client.emit('ai_response', {
        id: assistantMessage.id,
        role: 'assistant',
        content: aiResponse,
        createdAt: assistantMessage.created_at,
      });

      // 10. Verificar si se necesita actualizar resumen (cada 10 mensajes)
      console.log(`📝 Verificando si necesita actualizar resumen...`);
      await this.summaryService.checkAndUpdateSummary(conversationId, token);

      console.log(`✅ Flujo completado exitosamente`);
    } catch (error) {
      console.error('❌ Error en send_message:', error);
      client.emit('error', {
        message: 'Error al procesar el mensaje',
        code: 'MESSAGE_ERROR',
      });
    }
  }

  /**
   * Evento: usuario se une a una conversación
   */
  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const userId = client.data.userId;
    const token = client.data.token;

    try {
      // Validar que la conversación existe y pertenece al usuario
      const conversation = await this.conversationsService.findOne(
        payload.conversationId,
        userId,
        token,
      );

      if (conversation) {
        client.join(`conversation:${payload.conversationId}`);
        client.emit('joined_conversation', {
          conversationId: payload.conversationId,
        });

        console.log(
          `👤 Usuario ${userId} se unió a conversación ${payload.conversationId}`,
        );
      } else {
        client.emit('error', {
          message: 'No tienes acceso a esta conversación',
        });
      }
    } catch (error) {
      console.error('Error en join_conversation:', error);
      client.emit('error', {
        message: 'Error al unirse a la conversación',
      });
    }
  }

  /**
   * Evento: usuario abandona una conversación
   */
  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    client.leave(`conversation:${payload.conversationId}`);
    client.emit('left_conversation', {
      conversationId: payload.conversationId,
    });

    console.log(
      `👋 Usuario ${client.data.userId} abandonó conversación ${payload.conversationId}`,
    );
  }

  /**
   * Evento: obtener historial de mensajes
   */
  @SubscribeMessage('get_messages')
  async handleGetMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; limit?: number },
  ) {
    const token = client.data.token;

    try {
      const messages = await this.messagesService.findByConversation(
        payload.conversationId,
        token,
        payload.limit,
      );

      client.emit('messages_loaded', {
        conversationId: payload.conversationId,
        messages,
      });
    } catch (error) {
      console.error('Error en get_messages:', error);
      client.emit('error', {
        message: 'Error al cargar mensajes',
      });
    }
  }
}