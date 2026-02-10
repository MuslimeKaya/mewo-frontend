
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private get ai() {
    return new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY as string });
  }

  private getSystemInstruction() {
    // LocalStorage'dan haftalık hedefleri alıp sistem talimatına ekliyoruz.
    const savedGoal = localStorage.getItem('weekly_goal');
    const weeklyGoal = savedGoal ? JSON.parse(savedGoal) : null;
    const studentLevel = localStorage.getItem('mewo_student_level') || 'A1';
    const recommendedWords = JSON.parse(localStorage.getItem('mewo_recommended_words') || '[]');

    let missionContext = "";
    if (weeklyGoal) {
      missionContext = `
      CURRENT WEEKLY MISSION FOR THE STUDENT:
      - TARGET WORDS: ${weeklyGoal.words.join(', ')}
      - GRAMMAR FOCUS: ${weeklyGoal.grammar}
      
      Your goal is to subtly encourage the student to use these words and this grammar structure. 
      If they use a target word correctly, praise them!
      `;
    }

    return `
      You are "Mewo Tutor," a friendly and professional C2 Native English Language Expert.
      The student's current CEFR level according to their roadmap is: ${studentLevel}.
      RECOMMENDED WORDS TO TEACH NEXT: ${recommendedWords.join(', ')}.

      GUIDELINES:
      1. ADAPT YOUR LANGUAGE: Use vocabulary and sentence structures appropriate for a ${studentLevel} learner. 
      2. TARGET FOCUS: Subtly try to introduce or use the "RECOMMENDED WORDS" listed above in your conversation where natural.
      ${missionContext}
      3. When asked for translations, provide the meaning in Turkish, usage examples in English, and synonyms.
      4. If the user makes a grammar mistake, gently correct it and explain why.
      5. Use a natural and encouraging tone. Use Markdown for formatting.
    `;
  }

  async generateResponse(prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: this.getSystemInstruction(),
          temperature: 0.8,
        },
      });

      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  async translate(text: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the following English text to Turkish. 
        Provide: 
        1. Primary Turkish translation.
        2. 2-3 common usage examples in English with Turkish translations.
        3. Synonyms or related terms.
        Text to translate: "${text}"`,
        config: {
          systemInstruction: "You are a professional English-Turkish translator and linguist.",
          temperature: 0.2,
        },
      });
      return response.text;
    } catch (error) {
      console.error("Translation Error:", error);
      return "Translation failed. Please try again.";
    }
  }
}

export const geminiService = new GeminiService();
