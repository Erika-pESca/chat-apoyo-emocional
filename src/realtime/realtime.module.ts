import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';
import { MessagesModule } from '../messages/messages.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { AIModule } from '../ai/ai.module';
import { SentimentModule } from '../sentiment/sentiment.module';
import { SummaryModule } from '../summary/summary.module';

@Module({
  imports: [
    AuthModule,
    MessagesModule,
    ConversationsModule,
    AIModule,
    SentimentModule,
    SummaryModule,
  ],
  providers: [ChatGateway],
})
export class RealtimeModule {}