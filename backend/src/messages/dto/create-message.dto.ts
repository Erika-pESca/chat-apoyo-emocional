import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  @IsNotEmpty()
  conversationId: string;

  @IsEnum(['user', 'assistant'])
  @IsNotEmpty()
  role: 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @IsObject()
  sentimentScore?: {
    score?: number;
    label?: string;
    emotions?: string[];
    confidence?: number;
  };
}