declare module '@google/genai' {
    export class GoogleGenAI {
        constructor(options: { apiKey: string });
        live: {
            connect(config: any): Promise<any>;
        };
        models: {
            generateContent(config: {
                model: string;
                contents: any;
                config?: any;
            }): Promise<{ text: string }>;
        };
    }
    export enum Modality {
        AUDIO = 'AUDIO',
        TEXT = 'TEXT',
        IMAGE = 'IMAGE',
    }
    export enum Type {
        STRING = 'STRING',
        NUMBER = 'NUMBER',
        BOOLEAN = 'BOOLEAN',
        OBJECT = 'OBJECT',
        ARRAY = 'ARRAY',
    }
}
