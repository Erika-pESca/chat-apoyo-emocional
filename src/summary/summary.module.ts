import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SummaryService } from './summary.service';
import { AIModule } from '../ai/ai.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    ConfigModule,
    AIModule,
    ConversationsModule,
    MessagesModule,
  ],
  providers: [SummaryService],
  exports: [SummaryService],
})
export class SummaryModule {}