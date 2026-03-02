export const GEMINI_CONFIG = {
  models: {
    pro: 'gemini-3.1-pro-preview', // El Psicólogo de última generación
    flash: 'gemini-2.5-flash', // El Atleta más rápido y eficiente
  },
  generationConfig: {
    temperature: 0.75, // Ideal para coaching empático
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  },
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  ],
};