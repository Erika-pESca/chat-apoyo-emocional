# 🔴 PROBLEMA IDENTIFICADO: API Key sin Acceso a Gemini

## Diagnóstico

Todos los modelos devuelven error 404, excepto uno que devuelve 429 (límite excedido).
Esto significa que tu API key NO TIENE ACCESO a la Generative Language API.

## ✅ SOLUCIÓN PASO A PASO

### Opción 1: Usar Google AI Studio (MÁS FÁCIL) ⭐ RECOMENDADO

1. **Ve a Google AI Studio**
   🔗 https://aistudio.google.com/

2. **Inicia sesión** con tu cuenta de Google

3. **Haz clic en "Get API Key"** en la barra lateral izquierda

4. **Crea una nueva API key**
   - Si te pregunta por un proyecto, selecciona "Create API key in new project"
   - Esto creará automáticamente un proyecto con la API habilitada

5. **Copia la API key** que se genera

6. **Actualiza tu .env**
   ```env
   GEMINI_API_KEY=TU_NUEVA_API_KEY_AQUI
   ```

7. **Prueba nuevamente**
   ```bash
   node test-gemini-models.js
   ```

---

### Opción 2: Habilitar en Google Cloud Console (Más control)

1. **Ve a Google Cloud Console**
   🔗 https://console.cloud.google.com/

2. **Selecciona o crea un proyecto**

3. **Habilita la Generative Language API**
   - Ve a: APIs & Services > Library
   - Busca: "Generative Language API"
   - Haz clic en "Enable"

4. **Crea credenciales**
   - Ve a: APIs & Services > Credentials
   - Clic en "Create Credentials" > "API Key"
   - Copia la API key

5. **Actualiza tu .env**
   ```env
   GEMINI_API_KEY=TU_NUEVA_API_KEY_AQUI
   ```

---

## 🎯 Modelo Recomendado (Una vez que funcione)

Basándome en la investigación, estos son los modelos que deberían funcionar:

```typescript
// En: backend/src/ai/providers/gemini/gemini.config.ts

export const GEMINI_CONFIG = {
  model: 'gemini-1.5-flash',  // ← Usa este
  // ... resto de configuración
};
```

Alternativas si no funciona:
- `gemini-1.5-pro` (más lento pero mejor calidad)
- `gemini-pro` (modelo general)

---

## 📝 Checklist

- [ ] Generar nueva API key desde Google AI Studio
- [ ] Copiar la API key
- [ ] Actualizar backend/.env
- [ ] Ejecutar: `node test-gemini-models.js`
- [ ] Verificar que al menos un modelo funcione
- [ ] Actualizar gemini.config.ts con el modelo que funciona
- [ ] Reiniciar backend: `npm run start:dev`
- [ ] Probar el chat

---

## ⚠️ IMPORTANTE

**NO uses la API key anterior**. Genera una completamente nueva desde:
🔗 https://aistudio.google.com/app/apikey

Asegúrate de que cuando la generes, veas un mensaje como:
"API key created successfully for project: [nombre-proyecto]"

---

## 🆘 Si sigue sin funcionar

Si después de generar la nueva API key desde Google AI Studio sigue sin funcionar:

1. Verifica que copiaste la API key completa (sin espacios)
2. Asegúrate de que el archivo .env se guardó correctamente
3. Reinicia completamente el backend (Ctrl+C y luego npm run start:dev)
4. Contacta con soporte de Google AI Studio

---

## 📞 Enlaces Útiles

- Google AI Studio: https://aistudio.google.com/
- Documentación: https://ai.google.dev/docs
- Soporte: https://support.google.com/
