import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Configuración faltante: ${key}`);
    }
    return value;
  }

  getOptional(key: string, defaultValue?: string): string | undefined {
    if (defaultValue === undefined) {
      return this.configService.get<string>(key);
    }
    return this.configService.get<string>(key, defaultValue);
  }
}