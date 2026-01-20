import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  titulo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  estadoInicial?: string;
}