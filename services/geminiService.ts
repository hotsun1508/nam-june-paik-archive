import { GoogleGenAI, Type } from "@google/genai";
import type { Part } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

export const analyzeImageForText = async (imagePart: Part): Promise<{ title: string; text: string; }> => {
  try {
    const prompt = `
      You are an expert art historian and archivist. Your task is to analyze the provided newspaper image and return a JSON object.
      1.  Thoroughly scan the image to find any articles or text specifically mentioning the artist "Nam June Paik", "Nam Jun Paik", or "Paik Nam June".
      2.  If an article is found, identify its **main, largest, most prominent headline** as the 'title'.
      3.  **Sub-headlines and author bylines** (e.g., "By JOHN CANADAY") must NOT be included in the title. Instead, they should be treated as the beginning of the article's main text.
      4.  Mentally "mask" or isolate the specific article's content, including any sub-headlines and bylines, ignoring all other content on the page.
      5.  Perform a highly accurate Optical Character Recognition (OCR) on the text within that isolated section.
      6.  **Crucially, after extracting the raw text, reformat it into proper paragraphs.** This means:
          -   Combine adjacent lines that are part of the same sentence or paragraph.
          -   Remove hyphenation that occurs at the end of a line and join the word parts (e.g., "intel-\\nlectual" becomes "intellectual").
          -   The final output text should have blank lines (i.e., double newlines) separating distinct paragraphs. There should be no single newlines within a paragraph.
      7.  Return a JSON object with two keys: "title" and "text". The "text" value should be the reformatted, paragraph-style text, starting with any sub-headlines and the byline.
      8.  If no mention of the artist is found, return a JSON object with the title "No relevant article found" and the text "No relevant article found.".
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { 
                type: Type.STRING,
                description: "The main, largest headline of the article."
            },
            text: { 
                type: Type.STRING,
                description: "The full extracted text of the article, starting with any sub-headlines or bylines, formatted into clean paragraphs."
            },
        },
        required: ["title", "text"],
    };

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    
    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    return result;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a structured response from the AI model.");
  }
};