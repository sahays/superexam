import { GoogleGenerativeAI } from "@google/generative-ai";
import { Question } from "@/lib/types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

export async function generateQuestionsFromText(text: string, count: number = 10): Promise<Question[]> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API Key is missing");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an expert exam generator. 
    Analyze the following text and generate ${count} multiple-choice questions.
    
    Return ONLY a valid JSON array of objects. Do not include markdown formatting (like 
```json
). Each object must have this structure:
    {
      "text": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0, // The index (0-3) of the correct option
      "explanation": "Brief explanation of why this is correct"
    }

    Text content to analyze:
    ${text.substring(0, 30000)} // Truncate to avoid token limits if necessary, though 1.5 Flash has a large window
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Clean up potential markdown code blocks if the model adds them despite instructions
    const jsonString = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();

    const questions: Omit<Question, 'id'>[] = JSON.parse(jsonString);

    // Add IDs to the questions
    return questions.map((q, index) => ({
      ...q,
      id: `q-${Date.now()}-${index}`
    }));

  } catch (error) {
    console.error("Error generating questions with Gemini:", error);
    throw new Error("Failed to generate questions from text");
  }
}
