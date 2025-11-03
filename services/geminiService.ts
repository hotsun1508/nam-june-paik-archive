
import { GoogleGenAI } from "@google/genai";
import type { Part } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

export const analyzeImageForText = async (imagePart: Part): Promise<string> => {
  try {
    const prompt = `
      You are an expert art historian and archivist. Your task is to analyze the provided newspaper image.
      1.  Thoroughly scan the image to find any articles or text specifically mentioning the artist "Nam June Paik", "Nam Jun Paik", or "Paik Nam June".
      2.  If an article is found, mentally "mask" or isolate only that specific article's text, ignoring all other content on the page (like ads, other articles, etc.).
      3.  Perform a highly accurate Optical Character Recognition (OCR) on the text within that isolated section.
      4.  Return ONLY the full, extracted text of that article.
      5.  If no mention of the artist is found anywhere in the image, return the string "No relevant article found.".
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }, imagePart] },
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a response from the AI model.");
  }
};
