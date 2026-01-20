import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateMessageDto } from './dto/create-message.dto';

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  sentiment_score?: any;
  created_at: string;
}

@Injectable()
export class MessagesService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Crear nuevo mensaje
   */
  async create(dto: CreateMessageDto, token: string): Promise<Message> {
    const client = this.supabaseService.clientForUser(token);

    const { data, error } = await client
      .from('messages')
      .insert({
        conversation_id: dto.conversationId,
        role: dto.role,
        content: dto.content,
        sentiment_score: dto.sentimentScore || {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating message: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtener mensajes de una conversación
   * @param limit - Número de mensajes a retornar (últimos N)
   */
  async findByConversation(
    conversationId: string,
    token: string,
    limit?: number,
  ): Promise<Message[]> {
    const client = this.supabaseService.clientForUser(token);

    let query = client
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (limit) {
      // Para obtener los últimos N
      const { data: allMessages } = await query;
      const messages = allMessages || [];
      return messages.slice(-limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching messages: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Contar mensajes desde una fecha específica
   */
  async countSinceDate(
    conversationId: string,
    sinceDate: Date,
    token: string,
  ): Promise<number> {
    const client = this.supabaseService.clientForUser(token);

    const { count, error } = await client
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .gt('created_at', sinceDate.toISOString());

    if (error) {
      console.error('Error counting messages:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Obtener mensajes desde una fecha específica
   */
  async findSinceDate(
    conversationId: string,
    sinceDate: Date,
    token: string,
  ): Promise<Message[]> {
    const client = this.supabaseService.clientForUser(token);

    const { data, error } = await client
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .gt('created_at', sinceDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error fetching messages since date: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Formatear mensajes para prompt (útil para IA)
   */
  formatMessagesForPrompt(messages: Message[]): string {
    return messages
      .map((m) => {
        const role = m.role === 'user' ? 'Usuario' : 'Coach';
        return `${role}: ${m.content}`;
      })
      .join('\n\n');
  }
}