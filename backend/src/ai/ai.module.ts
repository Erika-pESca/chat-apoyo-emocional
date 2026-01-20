import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { GeminiService } from './providers/gemini/gemini.service';
import { PromptsService } from './prompts/prompts.service';
import { ResponseValidatorService } from './validators/response-validator.service';
import { ConversationsModule } from '../conversations/conversations.module';
import { MessagesModule } from '../messages/messages.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConversationsModule, MessagesModule],
  providers: [
    AIService,
    ConfigModule,
    GeminiService,
    PromptsService,
    ResponseValidatorService,
  ],
  exports: [AIService, GeminiService, PromptsService],
})
export class AIModule {}