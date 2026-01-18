
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis } from "../types";

// Always use process.env.API_KEY directly for initialization
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });

export const analyzeFailure = async (description: string, reason: string): Promise<AIAnalysis> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this failed startup. Provide a deep, cinematic narrative story about its rise and fall, and structured analysis.
    Description: ${description}
    Stated reason for failure: ${reason}
    
    The story should be compelling, divided into "The Ambition", "The Peak", and "The Collapse".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rootCause: { type: Type.STRING, description: "The deep underlying reason why it failed." },
          hiddenOpportunities: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "What did they miss that could have worked?"
          },
          suggestedPivot: { type: Type.STRING, description: "How could this concept be rebuilt today?" },
          viabilityScore: { type: Type.NUMBER, description: "0-100 score of how viable a pivot would be." },
          story: { type: Type.STRING, description: "A structured 3-paragraph story." }
        },
        required: ["rootCause", "hiddenOpportunities", "suggestedPivot", "viabilityScore", "story"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const predictFailureDetails = async (name: string, description: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the startup name "${name}" and description "${description}", reconstruct its forensic history. 
    If it's a real company, find its actual data. If it's a hypothetical or new idea, predict realistic values.
    Return JSON with: industry, foundedYear (number), defunctYear (number), valuationAtPeak (string), reasonForFailure (string).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          industry: { type: Type.STRING },
          foundedYear: { type: Type.NUMBER },
          defunctYear: { type: Type.NUMBER },
          valuationAtPeak: { type: Type.STRING },
          reasonForFailure: { type: Type.STRING }
        },
        required: ["industry", "foundedYear", "defunctYear", "valuationAtPeak", "reasonForFailure"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const evaluateSolution = async (failureContext: string, userSolution: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `The following startup failed: ${failureContext}. 
    A user suggested this solution: ${userSolution}. 
    Evaluate this solution and provide JSON with a score (0-100) and brief feedback.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING }
        },
        required: ["score", "feedback"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const getStartupChat = (startupName: string, description: string, failureReason: string) => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are a Startup Forensic Historian for the "Phoenix Post-Mortem" project. 
      Your expertise is in the failed company: ${startupName}.
      Context: ${description}
      Failure Reason: ${failureReason}
      
      Your goal is to help users understand why this company failed so they can build a better solution. 
      Be analytical, objective, and provide deep insights into market conditions, competition, and operational missteps. 
      If a user asks something unrelated to ${startupName} or startup failures, steer them back to the topic.`,
    }
  });
};
