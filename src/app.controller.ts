import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { SentimentService } from './sentiment/sentiment.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly sentimentService: SentimentService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Endpoint de prueba
  @Get('test-sentiment')
  async testSentiment(@Query('text') text: string) {
    if (!text) {
      return { error: 'Envía ?text=tu mensaje aquí' };
    }

    const result = await this.sentimentService.analyze(text);
    const description = this.sentimentService.getSentimentDescription(result);
    const needsSupport = this.sentimentService.needsUrgentSupport(result);

    return {
      text,
      result,
      description,
      needsSupport,
    };
  }
}