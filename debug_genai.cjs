const genai = require('@google/genai');
console.log('Keys:', Object.keys(genai));
if (genai.GoogleGenAI) {
    console.log('GoogleGenAI prototype:', Object.getOwnPropertyNames(genai.GoogleGenAI.prototype));
}
