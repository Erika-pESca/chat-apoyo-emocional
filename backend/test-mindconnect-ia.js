const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testMindConnectIA() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: No hay API Key en el .env');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Modelos configurados (usando prefijo models/ para mayor seguridad)
  const modelProName = 'gemini-3.1-pro-preview';
  const modelFlashName = 'gemini-2.5-flash';

  console.log('--- 🧪 PROBANDO IA DE MINDCONNECT ---');

  // 1. Probar el "Cerebro Pro" (Coaching)
  try {
    console.log(`\n🧠 Probando Cerebro Pro (${modelProName})...`);
    const modelPro = genAI.getGenerativeModel({ model: modelProName });
    const result = await modelPro.generateContent('Eres un coach emocional. Salúdame amablemente en una frase corta.');
    const response = await result.response;
    console.log('✅ Cerebro Pro respondiendo:', response.text().trim());
  } catch (error) {
    console.error(`❌ Cerebro Pro fallo: ${error.message}`);
  }

  // 2. Probar el "Cerebro Flash" (Resúmenes/Ahorro)
  try {
    console.log(`\n⚡ Probando Cerebro Flash (${modelFlashName})...`);
    const modelFlash = genAI.getGenerativeModel({ model: modelFlashName });
    const result = await modelFlash.generateContent('Di "Resumen OK"');
    const response = await result.response;
    console.log('✅ Cerebro Flash respondiendo:', response.text().trim());
  } catch (error) {
    console.error(`❌ Cerebro Flash fallo: ${error.message}`);
  }

  console.log('\n--- 🏁 PRUEBA FINALIZADA ---');
}

testMindConnectIA();
