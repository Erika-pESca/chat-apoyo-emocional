import { Module } from '@nestjs/common';
import { WsSupabaseAuthGuard } from './guards/ws-supabase-auth.guard';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [WsSupabaseAuthGuard],
  exports: [WsSupabaseAuthGuard],
})
export class AuthModule {}