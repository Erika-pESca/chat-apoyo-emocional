import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class WsSupabaseAuthGuard implements CanActivate {
  constructor(private supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      
      // Extraer token del handshake
      const token = this.extractTokenFromHandshake(client);
      
      if (!token) {
        throw new WsException('Token no proporcionado');
      }

      // Validar token con Supabase
      const user = await this.supabaseService.getUser(token);
      
      if (!user) {
        throw new WsException('Token inválido');
      }

      // Guardar user y token en el socket para uso posterior
      client.data.user = user;
      client.data.userId = user.id;
      client.data.token = token;

      return true;
    } catch (error) {
      console.error('WebSocket auth error:', error);
      throw new WsException(error.message || 'Autenticación fallida');
    }
  }

  /**
   * Extrae el token del handshake del socket
   * El frontend debe enviar: socket.io.opts.auth = { token: 'jwt...' }
   */
  private extractTokenFromHandshake(client: Socket): string | null {
    // Opción 1: desde auth object (recomendado)
    const authToken = client.handshake?.auth?.token;
    if (authToken) return authToken;

    // Opción 2: desde query params (fallback)
    const queryToken = client.handshake?.query?.token;
    if (queryToken && typeof queryToken === 'string') {
      return queryToken;
    }

    // Opción 3: desde headers (menos común en WebSocket)
    const headerToken = client.handshake?.headers?.authorization;
    if (headerToken) {
      return headerToken.replace('Bearer ', '');
    }

    return null;
  }
}