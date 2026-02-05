# GUÍA: Cómo Generar una Nueva API Key de Gemini

## ⚠️ PROBLEMA DETECTADO

Ningún modelo de Gemini funciona con tu API key actual.
Todos devuelven error 404 (No encontrado).

## ✅ SOLUCIÓN: Generar Nueva API Key

### Paso 1: Ve a Google AI Studio
🔗 https://aistudio.google.com/app/apikey

### Paso 2: Crea una nueva API Key
1. Haz clic en "Create API Key" o "Get API Key"
2. Selecciona un proyecto de Google Cloud (o crea uno nuevo)
3. Copia la API Key generada

### Paso 3: Actualiza tu archivo .env
Abre: `backend/.env`

Reemplaza la línea:
```
GEMINI_API_KEY=AIzaSyB4TFkNHG1PBY7IWVbj2OiDlHhhKyYyhdY
```

Con tu nueva API Key:
```
GEMINI_API_KEY=TU_NUEVA_API_KEY_AQUI
```

### Paso 4: Reinicia el backend
En la terminal, presiona Ctrl+C para detener el servidor
Luego ejecuta:
```
npm run start:dev
```

### Paso 5: Prueba nuevamente
Ejecuta el script de prueba:
```
node test-gemini-models.js
```

Debería mostrar al menos un modelo funcionando.

## 📝 MODELOS RECOMENDADOS (2026)

Una vez que tengas la nueva API key, estos modelos deberían funcionar:

1. **gemini-1.5-flash** (Recomendado para desarrollo)
2. **gemini-1.5-pro** (Mejor calidad)
3. **gemini-pro** (Alternativa estable)

## 🔧 CONFIGURACIÓN FINAL

Una vez que sepas qué modelo funciona, actualiza:
`backend/src/ai/providers/gemini/gemini.config.ts`

```typescript
export const GEMINI_CONFIG = {
  model: 'MODELO_QUE_FUNCIONO', // Ejemplo: 'gemini-1.5-flash'
  // ... resto de configuración
};
```

## ❓ ¿Necesitas ayuda?

Si después de generar la nueva API key sigues teniendo problemas:
1. Verifica que el proyecto de Google Cloud tenga la API de Gemini habilitada
2. Revisa que no haya límites de cuota
3. Asegúrate de que la API key esté correctamente copiada (sin espacios)
