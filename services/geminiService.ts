
/**
 * GEMINI AI CORE SERVICE - EXPERT ARCHITECTURE
 * Engineered by Mewo AI Systems
 */

export interface AIConfig {
  temperature: number;
  topK: number;
  topP: number;
  maxOutputTokens: number;
  candidateCount: number;
}

export class GeminiService {
  private readonly DEFAULT_CONFIG: AIConfig = {
    temperature: 0.8,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
    candidateCount: 1,
  };

  private getApiKey(): string | null {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('mewo_gemini_api_key');
      if (savedKey) return savedKey;
    }
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY || null;
  }

  /**
   * ADVANCED PROMPT ENGINEERING ENGINE
   * Dynamically constructs the system context based on student metadata.
   */
  private buildSystemInstruction(): string {
    const studentLevel = (typeof window !== 'undefined' ? localStorage.getItem('mewo_student_level') : 'A1') || 'A1';
    const recommendedWords = JSON.parse((typeof window !== 'undefined' ? localStorage.getItem('mewo_recommended_words') : '[]') || '[]');

    return `
      SYSTEM ROLE: Sen "Mewo Tutor" adında bir yapay zeka asistanısın. Görevin öğrencinin İngilizce öğrenmesini sağlamak.
      CONTEXT: Öğrenci Seviyesi: ${studentLevel}. Hedef Kelimeler: ${recommendedWords.join(', ')}.
      
      BEHAVIORAL CONSTRAINTS:
      1. FORMATTING: Yanıtlarında ASLA çift yıldız (**) veya kalın yazı (bold) kullanma. Bu kural mutlaktır.
      2. LANGUAGE: Açıklamalar TÜRKÇE, pratikler İNGİLİZCE olmalı.
      3. ADAPTIVITY: Kullanıcının prompt tarzına (uzunluk, ton, içerik) birebir uyum sağla.
      4. TEACHING: Hataları nazikçe düzelt, öğrenciyi teşvik et ve hedef kelimeleri konuşmaya yedir.
      
      TECHNICAL NOTE: Eğer kullanıcı doğrudan bir komut verirse (çeviri, özet, kod, hikaye vb.), eğitimci kimliğini koruyarak doğrudan görevi yerine getir.
    `.trim();
  }

  /**
   * CORE GENERATION ENGINE (AI EXPERT VERSION)
   * High-level Fail-safe + Dynamic Model Discovery + Adaptive Config
   */
  async generateResponse(prompt: string, history: any[] = [], customConfig?: Partial<AIConfig>) {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error("API_KEY_MISSING");

    const systemPrompt = this.buildSystemInstruction();
    const config = { ...this.DEFAULT_CONFIG, ...customConfig };

    // Context Window Management: Keep last 10 exchanges for stability
    const slicedHistory = history.slice(-10).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.text || msg.parts?.[0]?.text }]
    }));

    // Initial check for history validity
    const contents = slicedHistory.length > 0
      ? slicedHistory
      : [{ role: 'user', parts: [{ text: systemPrompt }] }, { role: 'model', parts: [{ text: "Anlaşıldı, hazırım!" }] }];

    const currentContents = [...contents, { role: 'user', parts: [{ text: prompt }] }];

    const executionPool = [
      { version: 'v1beta', model: 'gemini-2.0-flash' },
      { version: 'v1beta', model: 'gemini-1.5-flash' },
      { version: 'v1', model: 'gemini-pro' }
    ];

    let errorLog = [];

    // PHASE 1: Execution from Optimized Pool
    for (const execution of executionPool) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/${execution.version}/models/${execution.model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: currentContents,
              generationConfig: config,
              safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
              ]
            })
          }
        );

        const data = await response.json();

        // INTERCEPT QUOTA EXCEEDED (429 Rate Limits or Free Tier Limits)
        if (response.status === 429 || data.error?.message?.includes("exceeded your current quota")) {
          throw new Error("KOTA_DOLDU: Google Gemini API ücretsiz kullanım kotanız doldu. Lütfen 1 dakika bekleyin veya API planınızı kontrol edin.");
        }

        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          let text = data.candidates[0].content.parts[0].text;

          // EXPERT POST-PROCESSING: Hard removal of any markdown bold relics
          text = text.replace(/\*\*/g, '');

          return text;
        }
        errorLog.push(`${execution.model}: ${data.error?.message || `Status ${response.status}`}`);
      } catch (e: any) {
        // If it's our intercepted quota error, throw it immediately to stop trying other models
        if (e.message.startsWith("KOTA_DOLDU")) throw e;

        errorLog.push(`${execution.model}: ${e.message}`);
      }
    }

    // PHASE 2: Autonomous Model Discovery
    try {
      const discovery = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const info = await discovery.json();

      let validModel = info.models
        ?.find((m: any) => m.supportedGenerationMethods?.includes('generateContent') && m.name.includes('2.0-flash'))
        ?.name.split('/').pop();

      if (!validModel) {
        validModel = info.models
          ?.find((m: any) => m.supportedGenerationMethods?.includes('generateContent') && m.name.includes('1.5-flash'))
          ?.name.split('/').pop();
      }

      if (!validModel) {
        validModel = info.models
          ?.find((m: any) => m.supportedGenerationMethods?.includes('generateContent') && m.name.includes('pro'))
          ?.name.split('/').pop();
      }

      if (!validModel) {
        validModel = info.models
          ?.find((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
          ?.name.split('/').pop();
      }

      if (validModel) {
        const rescueResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${validModel}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: currentContents }) // Raw fallback
          }
        );
        const rescueData = await rescueResponse.json();
        if (rescueResponse.ok && rescueData.candidates?.[0]?.content?.parts?.[0]?.text) {
          return rescueData.candidates[0].content.parts[0].text;
        }
        errorLog.push(`Fallback ${validModel}: ${rescueData.error?.message}`);
      }
    } catch (e) { }

    throw new Error(`CRITICAL AI FAILURE: ${errorLog.join(' | ')}`);
  }

  /**
   * STRUCTURED TRANSLATION ENGINE
   */
  async translate(text: string) {
    const apiKey = this.getApiKey();
    if (!apiKey) return "API Key Configuration Error";

    const translationPrompt = `Translate the following text to Turkish, provide formal/informal variations and 2 usage examples. TEXT: "${text}"`;

    try {
      return await this.generateResponse(translationPrompt, [], { temperature: 0.3, maxOutputTokens: 500 });
    } catch (e) {
      return "Translation service is currently unavailable.";
    }
  }

  isConfigured(): boolean {
    return !!this.getApiKey();
  }

  setApiKey(key: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mewo_gemini_api_key', key);
    }
  }

  removeApiKey() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mewo_gemini_api_key');
    }
  }
}

export const geminiService = new GeminiService();
