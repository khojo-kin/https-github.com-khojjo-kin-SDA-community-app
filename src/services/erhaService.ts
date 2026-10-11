import { ai, ERHA_SYSTEM_INSTRUCTION } from '../lib/gemini.ts';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Calls Google AI (Gemini 3.8 Flash) with the Erha assistant persona and history.
 */
export async function askErhaGoogleAI(
  prompt: string,
  history: ChatMessage[] = []
): Promise<string> {
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  // Build multi-turn context
  for (const msg of history) {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: prompt }],
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents,
    config: {
      systemInstruction: ERHA_SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });

  return response.text || 'Peace be with you. How can I assist you with Scripture, hymns, or church fellowship today?';
}
