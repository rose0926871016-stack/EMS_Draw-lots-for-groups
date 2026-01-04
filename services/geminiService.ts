
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getEMSCommentary = async (name: string, type: 'winner' | 'group'): Promise<string> => {
  try {
    const prompt = type === 'winner' 
      ? `我正在進行緊急救護(EMS)課程的抽籤。恭喜 ${name} 中獎了！請用資深救護教官的口吻，說一句幽默且帶有救護專業梗的祝賀語。`
      : `這是一組救護學員的名單：${name}。請以救護教官的口吻，給這組學員一個有創意的「救護小隊」名稱並簡單鼓勵。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "你是一位資深緊急救護(EMS)教官，說話專業、風趣，喜歡用EMT、救護車、急救流程等術語開玩笑。",
        temperature: 0.8,
      }
    });

    return response.text || "保持冷靜，繼續救人！";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "祝賀你！準備好出勤了嗎？";
  }
};
