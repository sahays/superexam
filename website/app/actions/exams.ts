'use server';

import { db } from "@/lib/db/firebase";
import { revalidatePath } from "next/cache";

interface CreateExamSessionParams {
  documentId: string;
  questionCount: number;
  timerEnabled: boolean;
  timerMinutes?: number;
  randomize: boolean;
}

export async function createExamSession(params: CreateExamSessionParams) {
  try {
    const { documentId, questionCount, timerEnabled, timerMinutes, randomize } = params;

    // Get document
    const docRef = db.collection('documents').doc(documentId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { error: 'Document not found' };
    }

    // Get questions
    const questionsSnapshot = await docRef.collection('questions').get();
    let questions = questionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Randomize if requested
    if (randomize) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    // Limit to requested count
    questions = questions.slice(0, questionCount);

    if (questions.length === 0) {
      return { error: 'No questions available' };
    }

    // Create exam session
    const sessionRef = db.collection('exam-sessions').doc();
    const now = Date.now();

    const session = {
      id: sessionRef.id,
      documentId,
      questionIds: questions.map(q => q.id),
      answers: {},
      timerEnabled,
      timerMinutes: timerMinutes || null,
      timerStartedAt: timerEnabled ? now : null,
      startedAt: now,
      completedAt: null,
      score: null,
    };

    await sessionRef.set(session);

    return { success: true, sessionId: sessionRef.id };
  } catch (error) {
    console.error('Create exam session error:', error);
    return { error: 'Failed to create exam session' };
  }
}

export async function getExamSession(sessionId: string) {
  try {
    const sessionRef = db.collection('exam-sessions').doc(sessionId);
    const sessionSnap = await sessionRef.get();

    if (!sessionSnap.exists) {
      return { error: 'Session not found' };
    }

    const data = sessionSnap.data() as any;

    return {
      success: true,
      session: {
        ...data,
        id: sessionSnap.id,
        startedAt: data?.startedAt ?? Date.now(),
        timerStartedAt: data?.timerStartedAt ?? null,
        completedAt: data?.completedAt ?? null,
      }
    };
  } catch (error) {
    console.error('Get exam session error:', error);
    return { error: 'Failed to fetch exam session' };
  }
}

export async function updateExamAnswer(sessionId: string, questionId: string, answer: number) {
  try {
    const sessionRef = db.collection('exam-sessions').doc(sessionId);

    await sessionRef.update({
      [`answers.${questionId}`]: answer
    });

    return { success: true };
  } catch (error) {
    console.error('Update exam answer error:', error);
    return { error: 'Failed to save answer' };
  }
}

export async function submitExam(sessionId: string) {
  try {
    const sessionRef = db.collection('exam-sessions').doc(sessionId);
    const sessionSnap = await sessionRef.get();

    if (!sessionSnap.exists) {
      return { error: 'Session not found' };
    }

    const session = sessionSnap.data() as any;

    // Get document questions
    const docRef = db.collection('documents').doc(session.documentId);
    const questionsSnapshot = await docRef.collection('questions').get();
    const questionsMap = new Map(
      questionsSnapshot.docs.map(doc => [doc.id, doc.data()])
    );

    // Calculate score
    let correctCount = 0;
    let totalQuestions = session.questionIds.length;

    for (const questionId of session.questionIds) {
      const question = questionsMap.get(questionId);
      const userAnswer = session.answers[questionId];

      if (question && userAnswer !== undefined && userAnswer === question.correctAnswer) {
        correctCount++;
      }
    }

    const score = Math.round((correctCount / totalQuestions) * 100);

    // Update session
    await sessionRef.update({
      completedAt: Date.now(),
      score,
      correctCount,
      totalQuestions
    });

    revalidatePath(`/exams/${session.documentId}/session/${sessionId}`);

    return {
      success: true,
      score,
      correctCount,
      totalQuestions
    };
  } catch (error) {
    console.error('Submit exam error:', error);
    return { error: 'Failed to submit exam' };
  }
}

export async function getExamQuestions(documentId: string, questionIds: string[]) {
  try {
    const docRef = db.collection('documents').doc(documentId);
    const questions = [];

    for (const questionId of questionIds) {
      const questionSnap = await docRef.collection('questions').doc(questionId).get();
      if (questionSnap.exists) {
        questions.push({
          id: questionSnap.id,
          ...questionSnap.data()
        });
      }
    }

    return { success: true, questions };
  } catch (error) {
    console.error('Get exam questions error:', error);
    return { error: 'Failed to fetch questions' };
  }
}

export async function getExamSessions() {
  try {
    const sessionsSnapshot = await db.collection('exam-sessions')
      .orderBy('startedAt', 'desc')
      .get();

    const sessions = sessionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        documentId: data.documentId,
        questionIds: data.questionIds || [],
        answers: data.answers || {},
        timerEnabled: data.timerEnabled || false,
        timerMinutes: data.timerMinutes || null,
        timerStartedAt: data.timerStartedAt || null,
        startedAt: data.startedAt || Date.now(),
        completedAt: data.completedAt || null,
        score: data.score !== undefined ? data.score : null,
        correctCount: data.correctCount || 0,
        totalQuestions: data.totalQuestions || data.questionIds?.length || 0
      };
    });

    // Fetch document titles
    const sessionsWithDocs = await Promise.all(sessions.map(async (session) => {
      const docSnap = await db.collection('documents').doc(session.documentId).get();
      const docData = docSnap.data();

      return {
        ...session,
        documentTitle: docData?.title || 'Unknown Document'
      };
    }));

    return { success: true, sessions: sessionsWithDocs };
  } catch (error) {
    console.error('Get exam sessions error:', error);
    return { error: 'Failed to fetch exam sessions' };
  }
}
