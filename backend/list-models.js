const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    console.log('--- Listando modelos disponibles para tu API Key ---');
    // Intentamos listar modelos usando v1beta que es más permisiva para listar
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.models) {
      console.log('Modelos encontrados:');
      data.models.forEach(m => {
        console.log(`- ${m.name} (Soporta: ${m.supportedGenerationMethods.join(', ')})`);
      });
    } else {
      console.log('No se encontraron modelos o la respuesta fue inesperada:', data);
    }
  } catch (error) {
    console.error('Error al listar modelos:', error);
  }
}

listModels();
