import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_CONFIG } from './gemini.config';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: GEMINI_CONFIG.model,
    });
  }

  /**
   * Genera una respuesta de texto con Gemini
   */
  async generate(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: GEMINI_CONFIG.generationConfig,
        safetySettings: GEMINI_CONFIG.safetySettings,
      });

      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error('Gemini returned empty response');
      }

      return text.trim();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Genera streaming de respuesta (para futuro uso en chat en tiempo real)
   */
  async generateStream(prompt: string): Promise<AsyncGenerator<string>> {
    try {
      const result = await this.model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: GEMINI_CONFIG.generationConfig,
        safetySettings: GEMINI_CONFIG.safetySettings,
      });

      return this.streamGenerator(result.stream);
    } catch (error) {
      console.error('Error calling Gemini API (stream):', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Helper para generar chunks de texto del stream
   */
  private async *streamGenerator(stream: any): AsyncGenerator<string> {
    for await (const chunk of stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        yield chunkText;
      }
    }
  }
}