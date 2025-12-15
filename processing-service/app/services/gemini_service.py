import json
import time
import logging
import os
from typing import Optional
import google.generativeai as genai
from pydantic import BaseModel
from app.config import settings

logger = logging.getLogger(__name__)

class OptionSchema(BaseModel):
    index: str
    text: str

class QuestionSchema(BaseModel):
    questionText: str
    options: list[OptionSchema]
    correctAnswer: list[str]

class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel(settings.gemini_model)

    def generate_questions(
        self,
        pdf_buffer: bytes,
        system_prompt: str,
        custom_prompt: str,
        schema: Optional[str] = None
    ) -> list[dict]:
        """Generate exam questions from PDF using Gemini API"""

        # Combine prompts and schema
        prompt = f"""
{system_prompt}

{custom_prompt}
"""

        if schema:
            prompt += f"""

Additional Instructions:
{schema}
"""

        # Prepare PDF part for multimodal input
        pdf_part = {
            "mime_type": "application/pdf",
            "data": pdf_buffer
        }

        try:
            # Generate content
            logger.info(f"Sending request to Gemini API with prompt: {prompt}")
            
            generation_config = {
                "response_mime_type": "application/json",
                "response_schema": list[QuestionSchema]
            }
            
            # Note: By default, generate_content waits for the full response (no stream=True)
            response = self.model.generate_content(
                [prompt, pdf_part],
                generation_config=generation_config
            )
            
            # Check for safety blocks or empty responses
            if not response.parts:
                error_msg = "Gemini returned an empty response."
                if hasattr(response, 'prompt_feedback') and response.prompt_feedback:
                    if response.prompt_feedback.block_reason:
                        error_msg = f"Gemini blocked the request: {response.prompt_feedback.block_reason}"
                raise ValueError(error_msg)

            text_response = response.text
            logger.info(f"Gemini Raw Response: {text_response}")

            # Clean response (remove markdown code blocks if present)
            json_string = text_response.replace("```json", "").replace("```", "").strip()
            
            if not json_string:
                raise ValueError("Gemini returned empty text content")

            # Parse JSON response
            try:
                raw_questions = json.loads(json_string)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON from Gemini: {e}. Raw response: {text_response[:200]}...")
                raise ValueError(f"Gemini returned invalid JSON: {str(e)}")

            # Validate questions is a list
            if not isinstance(raw_questions, list):
                # Sometimes Gemini returns a dict with a key like "questions"
                if isinstance(raw_questions, dict) and "questions" in raw_questions:
                    raw_questions = raw_questions["questions"]
                else:
                    raise ValueError("Gemini response is not a list of questions")

            # Transform and add unique IDs to questions
            processed_questions = []
            timestamp = int(time.time())
            
            for i, q in enumerate(raw_questions):
                if not isinstance(q, dict):
                    raise ValueError(f"Gemini returned an invalid item at index {i}: expected dict, got {type(q).__name__}")

                # Parse correctAnswer list (e.g., ["A"] or ["A", "C"])
                correct_answers = q.get("correctAnswer", [])
                
                # Transform to match Frontend 'Question' interface
                processed_q = {
                    "id": f"q-{timestamp}-{i}",
                    "questionText": q.get("questionText", ""),
                    "correctAnswers": correct_answers,
                    "choices": q.get("options", [])
                }
                
                processed_questions.append(processed_q)

            return processed_questions

        except Exception as e:
            logger.error(f"Error in generate_questions: {e}")
            raise e


gemini_service = GeminiService()
