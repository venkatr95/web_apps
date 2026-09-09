import { PlantData } from '../types';

const SYSTEM_PROMPT = `
You are an expert botanist and plant appraiser. 
Analyze the provided image of a plant/tree and provide the following information in strict JSON format.
If the image is not a plant, return an error in the JSON.

Required JSON Structure:
{
  "common_name": "String",
  "scientific_name": "String",
  "plant_type": "String (e.g., Succulent, Tree, Herb)",
  "origin_country": "String",
  "history": "String (Brief 1-2 sentences about its discovery or historical significance)",
  "growth_suitability": "String (Indoor/Outdoor/Both)",
  "water_needs": "String (e.g., Low, Weekly, Keep moist)",
  "nourishment_needs": "String (e.g., Monthly fertilizer, High nitrogen)",
  "estimated_value": "String (e.g., $10 - $50 USD depending on size)",
  "fun_fact": "String (A short interesting fact)"
}
`;

export async function analyzePlantImage(base64Image: string, apiKey: string): Promise<PlantData> {
  if (!apiKey) {
    throw new Error("API Key is missing. Please add your OpenAI API key.");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // Using gpt-4o for best vision capabilities
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Identify this plant and provide the details as requested.",
              },
              {
                type: "image_url",
                image_url: {
                  url: base64Image,
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to analyze image");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content) as PlantData;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
}

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
