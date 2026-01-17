import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateConversationDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  titulo?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  summary_updated_at?: string;
}