import { GoogleGenerativeAI } from "@google/generative-ai";
import { db, collection } from "@/lib/db/firebase";
import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 2 requests per minute
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    const rateLimitCheck = await checkRateLimit(`rate_limit:explain:minute:${clientIp}`, 2, 60);
    if (!rateLimitCheck.allowed) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded: 2 requests per minute. Please wait." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const { documentId, questionId, promptId } = await request.json();

    if (!documentId || !questionId || !promptId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch question
    const questionRef = db.collection(collection('documents')).doc(documentId).collection('questions').doc(questionId);
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
    const promptSnap = await db.collection(collection('system-prompts')).doc(promptId).get();

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

Question: ${question.questionText}

Options:
${question.choices.map((choice: import("@/lib/types").QuestionChoice, idx: number) => `${typeof choice.index === 'string' ? choice.index : String.fromCharCode(65 + idx)}. ${choice.text}`).join('\n')}

Correct Answer(s): ${question.correctAnswers.map((ans: string | number) => {
  const choiceIdx = question.choices.findIndex((c: import("@/lib/types").QuestionChoice) => c.index === ans);
  const choice = question.choices[choiceIdx];
  return `${typeof choice.index === 'string' ? choice.index : String.fromCharCode(65 + choiceIdx)}. ${choice.text}`;
}).join(', ')}
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
