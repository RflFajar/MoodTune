import { GoogleGenAI, Type } from "@google/genai";
import { Mood } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function categorizeSong(title: string, artist: string): Promise<{ moods: Mood[], explanation: string, isValid: boolean }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analisis lagu "${title}" oleh "${artist}". 
      Pertama, tentukan apakah lagu ini benar-benar ada (nyata). Jika tidak nyata atau hanya input asal, set isValid ke false.
      Jika nyata:
      1. Tentukan mood yang cocok dari daftar ini: Bosan, Sedang Belajar, Sedang Bermain Game, Sedang diperjalanan, Sedih, Sedang Jogging, Bersemangat, Kangen.
      2. Berikan satu penjelasan singkat (maksimal 2 kalimat) kenapa lagu tersebut cocok dengan mood-mood yang dipilih dalam bahasa Indonesia.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: {
              type: Type.BOOLEAN,
              description: "Apakah lagu dan penyanyi ini nyata dan ada?"
            },
            moods: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                enum: [
                  "Bosan",
                  "Sedang Belajar",
                  "Sedang Bermain Game",
                  "Sedang diperjalanan",
                  "Sedih",
                  "Sedang Jogging",
                  "Bersemangat",
                  "Kangen"
                ]
              }
            },
            explanation: {
              type: Type.STRING,
              description: "Penjelasan singkat kenapa lagu ini cocok dengan mood tersebut."
            }
          },
          required: ["isValid", "moods", "explanation"]
        }
      }
    });

    const result = JSON.parse(response.text || '{"isValid": false, "moods": [], "explanation": ""}');
    return {
      isValid: result.isValid,
      moods: (result.moods || []) as Mood[],
      explanation: result.explanation || ""
    };
  } catch (error) {
    console.error("Error categorizing song:", error);
    return { isValid: false, moods: [], explanation: "" };
  }
}
