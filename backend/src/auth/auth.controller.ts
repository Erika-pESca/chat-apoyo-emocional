import { Controller, Post, Body, BadRequestException, Req } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as express from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Req() req: express.Request) {
    try {
      // Intentamos obtener el origin de la solicitud para el redireccionamiento
      // Si no viene, usamos un valor por defecto o de la configuración
      const origin = req.get('origin') || process.env.FRONTEND_URL || 'http://localhost:5173';
      const redirectTo = `${origin}/reset-password`;

      return await this.supabaseService.sendPasswordReset(resetPasswordDto.email, redirectTo);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
