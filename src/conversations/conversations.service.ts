import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Crear nueva conversación
   */
  async create(userId: string, dto: CreateConversationDto, token: string) {
    const client = this.supabaseService.clientForUser(token);

    const { data, error } = await client
      .from('conversations')
      .insert({
        user_id: userId,
        titulo: dto.titulo || 'Nueva conversación',
        estado_emocional_inicial: dto.estadoInicial,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating conversation: ${error.message}`);
    }

    return data;
  }

  /**
   * Listar todas las conversaciones del usuario
   */
  async findAll(userId: string, token: string) {
    const client = this.supabaseService.clientForUser(token);

    const { data, error } = await client
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching conversations: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtener una conversación específica
   */
  async findOne(conversationId: string, userId: string, token: string) {
    const client = this.supabaseService.clientForUser(token);

    const { data, error } = await client
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Conversación no encontrada');
    }

    return data;
  }

  /**
   * Actualizar conversación (título, resumen, etc)
   */
  async update(
    conversationId: string,
    userId: string,
    dto: UpdateConversationDto,
    token: string,
  ) {
    const client = this.supabaseService.clientForUser(token);

    const { data, error } = await client
      .from('conversations')
      .update(dto)
      .eq('id', conversationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating conversation: ${error.message}`);
    }

    return data;
  }

  /**
   * Eliminar conversación
   */
  async remove(conversationId: string, userId: string, token: string) {
    const client = this.supabaseService.clientForUser(token);

    const { error } = await client
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Error deleting conversation: ${error.message}`);
    }

    return { message: 'Conversación eliminada exitosamente' };
  }

  /**
   * Actualizar resumen de la conversación
   */
  async updateSummary(conversationId: string, summary: string, token: string) {
    const client = this.supabaseService.clientForUser(token);

    const { data, error } = await client
      .from('conversations')
      .update({
        summary,
        summary_updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating summary: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtener conversación con información de resumen
   */
  async getConversationWithSummary(conversationId: string, token: string) {
    const client = this.supabaseService.clientForUser(token);

    const { data, error } = await client
      .from('conversations')
      .select('summary, summary_updated_at, message_count')
      .eq('id', conversationId)
      .single();

    if (error || !data) {
      return { summary: null, summary_updated_at: null, message_count: 0 };
    }

    return data;
  }
}