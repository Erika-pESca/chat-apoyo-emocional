import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private adminClient: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.adminClient = createClient(
      this.configService.get('SUPABASE_URL'),
      this.configService.get('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  /**
   * Crea un cliente Supabase para un usuario específico
   * Esto permite que RLS funcione correctamente
   */
  clientForUser(token: string): SupabaseClient {
    return createClient(
      this.configService.get('SUPABASE_URL'),
      this.configService.get('SUPABASE_ANON_KEY'),
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  /**
   * Valida un token y retorna el user_id
   */
  async getUserId(token: string): Promise<string | null> {
    try {
      const { data, error } = await this.adminClient.auth.getUser(token);
      
      if (error || !data.user) {
        return null;
      }
      
      return data.user.id;
    } catch (error) {
      console.error('Error validating token:', error);
      return null;
    }
  }

  /**
   * Valida un token y retorna el usuario completo
   */
  async getUser(token: string) {
    try {
      const { data, error } = await this.adminClient.auth.getUser(token);
      
      if (error || !data.user) {
        throw new Error('Invalid token');
      }
      
      return data.user;
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }

  /**
   * Cliente admin (usar con precaución, bypasea RLS)
   */
  getAdminClient(): SupabaseClient {
    return this.adminClient;
  }
}