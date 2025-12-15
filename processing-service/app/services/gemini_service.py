import json
import time
import logging
import os
from typing import Optional
import google.generativeai as genai
from jsonschema import validate, ValidationError
from app.config import settings

logger = logging.getLogger(__name__)

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

        # Load the external schema
        try:
            schema_path = os.path.join(os.path.dirname(__file__), "../schemas/question_schema.json")
            with open(schema_path, "r") as f:
                response_schema = json.load(f)
        except Exception as e:
            logger.error(f"Failed to load response schema: {e}")
            raise ValueError(f"Configuration error: Could not load response schema: {str(e)}")

        try:
            # Generate content
            logger.info(f"Sending request to Gemini API with prompt: {prompt}")
            
            generation_config = {
                "response_mime_type": "application/json",
                "response_schema": response_schema
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

            # Validate against schema
            try:
                validate(instance=raw_questions, schema=response_schema)
            except ValidationError as e:
                logger.error(f"Schema validation failed: {e}")
                raise ValueError(f"Gemini response did not match expected schema: {e.message}")

            # Transform and add unique IDs to questions
            processed_questions = []
            timestamp = int(time.time())
            
            for i, q in enumerate(raw_questions):
                # Parse correctAnswer string (e.g., "A" or "AC") into list of strings ["A"] or ["A", "C"]
                raw_answer = q.get("correctAnswer", "")
                correct_answers = list(raw_answer) if raw_answer else []

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
