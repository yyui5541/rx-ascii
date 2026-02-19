import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Edits an image using Gemini 2.5 Flash Image based on a text prompt.
 * @param base64Image The source image in base64 format (data URL).
 * @param prompt The user's editing instruction.
 * @returns The edited image as a base64 string.
 */
export const editImageWithGemini = async (
  base64Image: string,
  prompt: string
): Promise<string> => {
  const client = getClient();
  
  // Clean base64 string to get raw data
  const base64Data = base64Image.split(',')[1];
  const mimeType = base64Image.split(';')[0].split(':')[1] || 'image/png';

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: `Act as an image editor. Return ONLY the edited image. ${prompt}`
          }
        ]
      },
      // Gemini 2.5 Flash Image output handling
      // Note: Typically 2.5 Flash Image returns image parts in the response
    });

    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      throw new Error("No content generated");
    }

    // Find the image part
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }

    // Fallback if no inlineData found immediately
    throw new Error("Gemini did not return an image. It might have refused the request.");
  } catch (error) {
    console.error("Gemini Edit Error:", error);
    throw error;
  }
};