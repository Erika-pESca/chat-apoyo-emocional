import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { SentimentModule } from './sentiment/sentiment.module';
import { AIModule } from './ai/ai.module';
import { SummaryModule } from './summary/summary.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [ConfigModule, SupabaseModule, AuthModule, ConversationsModule, MessagesModule, SentimentModule, AIModule, SummaryModule, RealtimeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
