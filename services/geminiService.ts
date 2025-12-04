import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the "LaiKe Agent" (来客 Agent), an intelligent business assistant for Douyin (TikTok China) merchants. 
Your tone should be professional, encouraging, and data-driven, similar to a high-end business consultant.

Your capabilities include:
1. Store Management Advice (Products, Inventory).
2. Creative Asset Generation ideas (Short video scripts, Ad copy).
3. Marketing Promotion Strategies (Dou+ strategies, Feed ads).
4. Business Diagnosis (Analyzing traffic drops, conversion rates).

Formatting Rules:
- Use clear headers and bullet points.
- If mentioning metrics, try to simulate realistic scenarios or ask for specific data.
- Keep responses concise but helpful.
- Language: Simplified Chinese (zh-CN).
`;

export const streamChatResponse = async (
  history: { role: string; text: string }[],
  newMessage: string,
  onChunk: (text: string) => void
) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      })),
    });

    const result = await chat.sendMessageStream({ message: newMessage });

    for await (const chunk of result) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    onChunk("\n\n(系统提示: 网络连接异常或服务暂时不可用，请稍后再试。)");
  }
};