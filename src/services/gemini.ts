import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export type AnalysisType = 'pros-cons' | 'comparison' | 'swot';

export interface AnalysisResult {
  title: string;
  content: string;
  type: AnalysisType;
}

const SYSTEM_INSTRUCTION = `You are "The Tiebreaker", an expert decision-making assistant. 
Your goal is to help users make difficult choices by providing clear, objective, and structured analysis.

When a user provides a decision or dilemma:
1. If the user asks for "Pros and Cons", provide a balanced list of advantages and disadvantages.
2. If the user asks for a "Comparison", create a detailed comparison table or list between the options.
3. If the user asks for a "SWOT Analysis", provide Strengths, Weaknesses, Opportunities, and Threats for the situation.

Always maintain a neutral, helpful tone. Focus on actionable insights and potential blind spots.
Use Markdown for formatting. For tables, use standard Markdown table syntax.`;

export async function analyzeDecision(
  decision: string, 
  type: AnalysisType
): Promise<AnalysisResult> {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `Analyze the following decision using a ${type.replace('-', ' ')} analysis:
  
  Decision: "${decision}"
  
  Provide a comprehensive and insightful analysis.`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });

  return {
    title: decision,
    content: response.text || "No analysis generated.",
    type,
  };
}
