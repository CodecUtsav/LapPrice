
import { GoogleGenAI, Type } from "@google/genai";
import { Laptop } from "./types";

const createAIClient = () => {
  if (!process.env.API_KEY) {
    // In a real scenario, handle this gracefully or throw.
    // For this demo, we assume the environment is set up correctly as per instructions.
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const predictLaptopPrice = async (
  specs: Partial<Laptop>,
  datasetSample: Laptop[]
): Promise<{ price: number; reasoning: string }> => {
  const ai = createAIClient();
  
  // Use a smaller, representative sample to fit in context window if needed
  const sampleText = datasetSample
    .slice(0, 40) 
    .map(l => `${l.company} ${l.typeName}: ${l.ram}GB RAM, ${l.cpu}, ${l.memory}, ${l.gpu} -> ₹${Math.round(l.price)}`)
    .join('\n');

  const prompt = `
    You are an expert laptop pricing estimator. 
    Using the provided reference data trends, estimate the price for a laptop with the following specifications.
    
    Reference Data Sample:
    ${sampleText}

    Target Specifications:
    Company: ${specs.company || 'Unknown'}
    Type: ${specs.typeName || 'Unknown'}
    Ram: ${specs.ram ? specs.ram + 'GB' : 'Unknown'}
    CPU: ${specs.cpu || 'Unknown'}
    GPU: ${specs.gpu || 'Unknown'}
    Storage: ${specs.memory || 'Unknown'}
    OS: ${specs.opSys || 'Unknown'}
    Weight: ${specs.weight ? specs.weight + 'kg' : 'Unknown'}

    Return a JSON object with:
    - predictedPrice: number (in INR)
    - reasoning: string (brief explanation comparing to similar models in data)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedPrice: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
          },
          required: ["predictedPrice", "reasoning"],
        },
      },
    });

    let text = response.text || "{}";
    // Cleanup markdown code blocks if present (common issue with LLMs)
    text = text.replace(/```json|```/g, '').trim();

    const result = JSON.parse(text);
    return {
      price: result.predictedPrice || 0,
      reasoning: result.reasoning || "Could not generate reasoning.",
    };
  } catch (error) {
    console.error("Prediction Error:", error);
    return { 
      price: 0, 
      reasoning: "Error generating prediction. Please ensure the API Key is configured and valid." 
    };
  }
};

export const chatWithData = async (
  query: string,
  history: { role: string; text: string }[],
  dataContext: string
): Promise<string> => {
  const ai = createAIClient();

  const systemInstruction = `
    You are a data analyst for a laptop pricing dashboard.
    You have access to a dataset of laptops.
    Answer questions based on the data provided below.
    Be concise, professional, and data-driven.
    
    Data Context Summary:
    ${dataContext}
  `;

  // Construct conversation history
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));
  
  // Add current query
  contents.push({
    role: 'user',
    parts: [{ text: query }]
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I couldn't generate a response based on the data.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I encountered an error processing your request. Please check your API key.";
  }
};
