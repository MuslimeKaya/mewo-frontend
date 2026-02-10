
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  // Her çağrıda yeni instance oluşturmak güncel API key yönetimi için daha güvenlidir
  private getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  async generateTutorResponse(prompt: string, history: any[] = []) {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are Mewo, a C2 Native English Tutor. Use professional yet encouraging tone.",
        temperature: 0.7,
      },
    });

    return response.text; // .text property kullanılıyor (.text() değil)
  }

  async translate(text: string) {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate to Turkish with usage examples: "${text}"`,
      config: {
        systemInstruction: "You are a professional linguistic engine.",
      },
    });
    return response.text;
  }
}

export const gemini = new GeminiService();
