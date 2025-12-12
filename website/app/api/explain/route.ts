import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db/firebase";
import { NextRequest } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { documentId, questionId, promptId, promptType } = await request.json();

    if (!documentId || !questionId || !promptId || !promptType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch question
    const questionRef = db.collection('documents').doc(documentId).collection('questions').doc(questionId);
    const questionSnap = await questionRef.get();

    if (!questionSnap.exists) {
      return new Response(
        JSON.stringify({ error: "Question not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const question = questionSnap.data();

    if (!question) {
      return new Response(
        JSON.stringify({ error: "Question data is missing" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch prompt
    const promptCollection = promptType === 'system' ? 'system-prompts' : 'custom-prompts';
    const promptSnap = await db.collection(promptCollection).doc(promptId).get();

    if (!promptSnap.exists) {
      return new Response(
        JSON.stringify({ error: "Prompt not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const promptData = promptSnap.data();

    if (!promptData) {
      return new Response(
        JSON.stringify({ error: "Prompt data is missing" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build the explanation request prompt
    const explanationPrompt = `
${promptData.content}

Please provide a detailed explanation for the following question and its answer choices:

Question: ${question.text}

Options:
${question.options.map((opt: string, idx: number) => `${String.fromCharCode(65 + idx)}. ${opt}`).join('\n')}

Correct Answer: ${String.fromCharCode(65 + question.correctAnswer)}. ${question.options[question.correctAnswer]}

Provide a clear, educational explanation that helps the student understand why the correct answer is right and why the other options are incorrect.
    `;

    // Initialize Gemini model for streaming
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await model.generateContentStream(explanationPrompt);

          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullResponse += chunkText;

            // Send chunk to client
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`)
            );
          }

          // Stream complete - save to Firestore
          await questionRef.update({
            explanation: {
              content: fullResponse,
              promptId: promptId,
              promptName: promptData.name,
              promptType: promptType,
              generatedAt: Date.now()
            }
          });

          // Send completion event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
          );

          controller.close();
        } catch (error) {
          console.error("Error generating explanation:", error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "Failed to generate explanation" })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Explanation API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
