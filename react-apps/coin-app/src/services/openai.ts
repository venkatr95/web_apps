import OpenAI from 'openai';
import { CoinData } from '../types';

export const analyzeCoinImage = async (base64Image: string, apiKey: string): Promise<CoinData> => {
  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // Required for client-side execution
  });

  const prompt = `
    You are an expert numismatist. Analyze the uploaded image of a coin.
    Identify the coin and provide the following details in strict JSON format:
    
    {
      "name": "Name of the coin (e.g., 1921 Morgan Silver Dollar)",
      "country": "Country of origin",
      "year": "Year of minting (or range if not visible)",
      "value_estimate": "Estimated value range in USD (e.g., $25 - $50)",
      "composition": "Metal composition (e.g., 90% Silver, 10% Copper)",
      "history": "A brief historical context (max 3 sentences).",
      "fun_fact": "One interesting short fact about this coin type."
    }

    If the image is NOT a coin, return a JSON with a single field "error" explaining why.
    Do not include markdown formatting (like \`\`\`json), just the raw JSON string.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("No analysis received from AI.");
    }

    // Clean up potential markdown formatting if the model ignores instructions
    const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(cleanContent);

    if (parsed.error) {
      throw new Error(parsed.error);
    }

    return parsed as CoinData;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};
