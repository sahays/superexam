import json
import time
import logging
from typing import Optional
import google.generativeai as genai
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

Schema:
{schema}
"""

        # Prepare PDF part for multimodal input
        pdf_part = {
            "mime_type": "application/pdf",
            "data": pdf_buffer
        }

        try:
            # Generate content
            logger.info("Sending request to Gemini API...")
            response = self.model.generate_content([prompt, pdf_part])
            
            # Check for safety blocks or empty responses
            if not response.parts:
                error_msg = "Gemini returned an empty response."
                if hasattr(response, 'prompt_feedback') and response.prompt_feedback:
                    if response.prompt_feedback.block_reason:
                        error_msg = f"Gemini blocked the request: {response.prompt_feedback.block_reason}"
                raise ValueError(error_msg)

            text_response = response.text

            # Clean response (remove markdown code blocks if present)
            json_string = text_response.replace("```json", "").replace("```", "").strip()
            
            if not json_string:
                raise ValueError("Gemini returned empty text content")

            # Parse JSON response
            try:
                questions = json.loads(json_string)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON from Gemini: {e}. Raw response: {text_response[:200]}...")
                raise ValueError(f"Gemini returned invalid JSON: {str(e)}")

            # Validate questions is a list
            if not isinstance(questions, list):
                # Sometimes Gemini returns a dict with a key like "questions"
                if isinstance(questions, dict) and "questions" in questions:
                    questions = questions["questions"]
                else:
                    raise ValueError("Gemini response is not a list of questions")

            # Add unique IDs to questions
            timestamp = int(time.time())
            for i, q in enumerate(questions):
                q["id"] = f"q-{timestamp}-{i}"

            return questions

        except Exception as e:
            logger.error(f"Error in generate_questions: {e}")
            raise e


gemini_service = GeminiService()
