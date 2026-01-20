import { Module } from '@nestjs/common';
import { SentimentService } from './sentiment.service';
import { BasicSentimentAnalyzer } from './analyzers/basic-sentiment.analyzer';

@Module({
  providers: [SentimentService, BasicSentimentAnalyzer],
  exports: [SentimentService],
})
export class SentimentModule {}