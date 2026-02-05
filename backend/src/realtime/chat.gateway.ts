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
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowedOrigins = [
        process.env.CORS_ORIGIN,
        'http://localhost:5173',
        'http://localhost:3000',
      ];
      const originAux = origin || '';
      if (allowedOrigins.includes(originAux) || /^http:\/\/localhost:\d+$/.test(originAux)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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

  async handleConnection(client: Socket) {
    // La autenticación y el adjuntar el usuario al socket se manejan en el WsSupabaseAuthGuard.
    // El guard se ejecuta en cada @SubscribeMessage, no en OnGatewayConnection.
    // Por lo tanto, no podemos acceder a `client.data.user` aquí de forma segura.
    console.log(`🔌 Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    console.log(`❌ Usuario desconectado: ${user?.email || 'Unknown'}`);
  }

  @SubscribeMessage('create_conversation_with_first_message')
  async handleCreateConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { message: string },
  ) {
    const userId = client.data.userId;
    const token = client.data.token;
    const { message } = payload;

    try {
      const newConversation = await this.conversationsService.create(
        userId,
        {
          titulo: message.substring(0, 40) + (message.length > 40 ? '...' : ''),
        },
        token,
      );
      console.log(`✨ Conversación creada: ${newConversation.id}`);
      
      client.emit('conversation_created', newConversation);
      
      await this.processAndRespond(client, newConversation.id, message);
    } catch (error) {
      console.error('❌ Error en create_conversation_with_first_message:', error);
      client.emit('error', {
        message: 'Error al crear la conversación',
        code: 'CONVERSATION_CREATE_ERROR',
      });
    }
  }
  
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessagePayload,
  ) {
    await this.processAndRespond(client, payload.conversationId, payload.message);
  }

  private async processAndRespond(
    client: Socket,
    conversationId: string,
    message: string,
  ) {
    const userId = client.data.userId;
    const token = client.data.token;

    try {
      console.log(`📨 Mensaje recibido de ${userId} en conv ${conversationId}: "${message}"`);
      
      const conversation = await this.conversationsService.findOne(
        conversationId,
        userId,
        token,
      );
      if (!conversation) {
        client.emit('error', { message: 'Conversación no encontrada' });
        return;
      }
      
      const sentiment = await this.sentimentService.analyze(message);
      console.log(`🎭 Sentimiento: ${sentiment.label}`);

      const userMessage = await this.messagesService.create(
        {
          conversationId,
          role: 'user',
          content: message,
          sentimentScore: sentiment,
        },
        token,
      );

      client.emit('message_received', userMessage);

      client.emit('ai_typing', { conversationId, isTyping: true });

      console.log(`🤖 Generando respuesta de IA...`);
      const aiResponse = await this.aiService.generateCoachingResponse({
        userMessage: message,
        conversationId,
        token,
      });
      console.log(`✅ Respuesta generada: "${aiResponse.substring(0, 50)}..."`);
      
      const assistantMessage = await this.messagesService.create(
        {
          conversationId,
          role: 'assistant',
          content: aiResponse,
        },
        token,
      );

      client.emit('ai_typing', { conversationId, isTyping: false });
      client.emit('ai_response', assistantMessage);

      console.log(`📝 Verificando si necesita actualizar resumen...`);
      await this.summaryService.checkAndUpdateSummary(conversationId, token);
      console.log(`✅ Flujo completado exitosamente`);
    } catch (error) {
      console.error(`❌ Error en processAndRespond para conv ${conversationId}:`, error);
      client.emit('error', {
        message: 'Error al procesar el mensaje',
        code: 'MESSAGE_ERROR',
      });
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const userId = client.data.userId;
    const token = client.data.token;

    try {
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