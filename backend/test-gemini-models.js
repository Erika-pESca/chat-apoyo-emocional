const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const log = [];

async function testModels() {
    // Probar modelos con diferentes formatos de nombre
    const modelsToTest = [
        // Modelos con prefijo completo
        'models/gemini-1.5-flash',
        'models/gemini-1.5-pro',
        'models/gemini-pro',

        // Modelos sin prefijo
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro',

        // Modelos con -latest
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro-latest',

        // Modelos experimentales
        'gemini-2.0-flash-exp',
        'gemini-exp-1206',

        // Modelos versión específica
        'gemini-1.5-flash-001',
        'gemini-1.5-flash-002',
    ];

    log.push(`API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
    log.push('');
    log.push('Probando modelos de Gemini (incluyendo formatos alternativos)...');
    log.push('');

    let workingModel = null;

    for (const modelName of modelsToTest) {
        try {
            log.push(`Probando: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent('Di "OK" en una palabra');
            const response = await result.response;
            const text = response.text();

            log.push(`  ✓✓✓ OK - ${modelName} FUNCIONA! ✓✓✓`);
            log.push(`  Respuesta: "${text.trim()}"`);
            log.push('');

            if (!workingModel) {
                workingModel = modelName;
            }

        } catch (error) {
            log.push(`  X ERROR - ${modelName} fallo`);
            log.push(`  Mensaje: ${error.message.substring(0, 100)}...`);
            log.push(`  Status: ${error.status || 'N/A'}`);
            log.push('');
        }
    }

    log.push('='.repeat(60));

    if (workingModel) {
        log.push('');
        log.push(`*** EXITO! MODELO RECOMENDADO: ${workingModel} ***`);
        log.push('');
        log.push('Actualiza en: backend/src/ai/providers/gemini/gemini.config.ts');
        log.push(`Cambia a: model: '${workingModel}',`);
    } else {
        log.push('');
        log.push('*** NINGUN MODELO FUNCIONO ***');
        log.push('');
        log.push('POSIBLES CAUSAS:');
        log.push('1. La API key no tiene acceso a la API de Gemini');
        log.push('2. Necesitas habilitar la API en Google Cloud Console');
        log.push('3. La API key fue generada en un proyecto sin acceso a Gemini');
        log.push('');
        log.push('SOLUCION:');
        log.push('1. Ve a: https://console.cloud.google.com/');
        log.push('2. Selecciona tu proyecto');
        log.push('3. Habilita "Generative Language API"');
        log.push('4. O genera la API key desde: https://aistudio.google.com/app/apikey');
    }

    log.push('');
    log.push('='.repeat(60));

    const output = log.join('\n');
    fs.writeFileSync('test-result.txt', output);
    console.log(output);
}

testModels().catch(err => {
    log.push('ERROR FATAL: ' + err.message);
    fs.writeFileSync('test-result.txt', log.join('\n'));
    console.error(err);
});
