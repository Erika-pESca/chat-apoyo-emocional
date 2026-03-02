import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_CONFIG } from './gemini.config';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private modelPro: any;
  private modelFlash: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('GEMINI_API_KEY');

    if (!apiKey) {
      console.error('GEMINI_API_KEY is not defined in environment variables.');
      throw new Error('Gemini API key is missing.');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    console.log(`🤖 Inicializando Gemini Models: Pro: ${GEMINI_CONFIG.models.pro}, Flash: ${GEMINI_CONFIG.models.flash}`);

    // Inicializamos ambos modelos con la API estándar para mayor estabilidad
    this.modelPro = this.genAI.getGenerativeModel({
      model: GEMINI_CONFIG.models.pro,
      generationConfig: GEMINI_CONFIG.generationConfig as any,
      safetySettings: GEMINI_CONFIG.safetySettings as any,
    });

    this.modelFlash = this.genAI.getGenerativeModel({
      model: GEMINI_CONFIG.models.flash,
      generationConfig: GEMINI_CONFIG.generationConfig as any,
      safetySettings: GEMINI_CONFIG.safetySettings as any,
    });
  }

  /**
   * Genera una respuesta de texto eligiendo el modelo (por defecto Pro)
   */
  async generate(prompt: string, useFlash: boolean = false): Promise<string> {
    try {
      const model = useFlash ? this.modelFlash : this.modelPro;
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Genera streaming de respuesta eligiendo el modelo (por defecto Pro)
   */
  async generateStream(prompt: string, useFlash: boolean = false): Promise<AsyncGenerator<string>> {
    try {
      const model = useFlash ? this.modelFlash : this.modelPro;
      const result = await model.generateContentStream({
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