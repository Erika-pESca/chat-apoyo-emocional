# Modelos Gemini Disponibles (2026)

## Modelos Recomendados

### 1. gemini-2.0-flash-exp (ACTUAL)
- **Estado**: Experimental
- **Velocidad**: Muy rápida
- **Uso**: Desarrollo y pruebas
- **Configuración actual**: ✅ Configurado

### 2. gemini-1.5-pro
- **Estado**: Estable
- **Velocidad**: Media
- **Uso**: Producción
- **Mejor para**: Razonamiento complejo

### 3. gemini-pro
- **Estado**: Estable
- **Velocidad**: Media
- **Uso**: General

## Cómo Cambiar de Modelo

Edita el archivo: `backend/src/ai/providers/gemini/gemini.config.ts`

```typescript
export const GEMINI_CONFIG = {
  model: 'gemini-2.0-flash-exp', // Cambia aquí
  // ... resto de la configuración
};
```

## Modelos Retirados (NO USAR)

❌ `gemini-1.5-flash` - Retirado en 2025
❌ `gemini-1.5-flash-001` - Retirado en Mayo 2025
❌ `gemini-1.5-flash-002` - Retirado en Septiembre 2025

## Verificar API Key

Si sigues teniendo problemas, verifica que tu API key sea válida:
1. Ve a: https://aistudio.google.com/app/apikey
2. Genera una nueva API key si es necesario
3. Actualiza en: `backend/.env`

```env
GEMINI_API_KEY=tu_nueva_api_key_aqui
```
