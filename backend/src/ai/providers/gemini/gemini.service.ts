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

    // Obtenemos el nombre del modelo directamente del .env, si no existe usa el flash por defecto


    if (!apiKey) {
      console.error('GEMINI_API_KEY is not defined in environment variables.');
      throw new Error('Gemini API key is missing.');
    }

    console.log(`Using Gemini API Key: ${apiKey.substring(0, 5)}...`);


    this.genAI = new GoogleGenerativeAI(apiKey);

    this.model = this.genAI.getGenerativeModel({
      model: GEMINI_CONFIG.model,
      generationConfig: GEMINI_CONFIG.generationConfig as any,
      safetySettings: GEMINI_CONFIG.safetySettings as any,
    }, { apiVersion: 'v1beta' });
  }

  /**
   * Genera una respuesta de texto con Gemini
   */
  async generate(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        // Ya no es necesario pasar la config aquí si se pasó en el constructor, 
        // pero dejarlo no hace daño.
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
   * Genera streaming de respuesta
   */
  async generateStream(prompt: string): Promise<AsyncGenerator<string>> {
    try {
      const result = await this.model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
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