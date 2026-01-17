import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}