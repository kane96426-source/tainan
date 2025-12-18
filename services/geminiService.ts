
import { GoogleGenAI } from "@google/genai";

export const getAIFoodAdvice = async (restaurantName: string, reviews: string[]) => {
  // Fix: Initializing GoogleGenAI inside the function call with process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        你是一位台南大學的學長，請根據以下這家餐廳「${restaurantName}」的評論，為學弟妹總結一下這家店到底好不好吃、推薦點什麼？
        評論內容：${reviews.join(' | ')}
        
        請用親切、口語化的口吻，大約 50 字以內。
      `,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "學長目前在忙，沒辦法給你建議呢！不過這家店看起來挺有趣的。";
  }
};
