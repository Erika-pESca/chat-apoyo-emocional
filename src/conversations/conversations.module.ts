import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}