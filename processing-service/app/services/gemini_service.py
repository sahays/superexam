import json
import time
import logging
import os
from typing import Optional
from google import genai
from pydantic import BaseModel, Field
from app.config import settings
from app.services.pdf_service import pdf_service

logger = logging.getLogger(__name__)

class OptionSchema(BaseModel):
    index: str = Field(
        description="The identifier for this choice (e.g., 'A', 'B', 'C', 'D' or 1, 2, 3, 4)"
    )
    text: str = Field(
        description="The text content of this answer choice"
    )

class QuestionSchema(BaseModel):
    questionText: str = Field(
        description="The complete text of the exam question"
    )
    options: list[OptionSchema] = Field(
        description="List of possible answer choices for this question",
        min_length=2
    )
    correctAnswer: list[str] = Field(
        description="List of correct choice indices (e.g., ['A'] for single-select or ['A', 'C'] for multi-select)",
        min_length=1
    )

class QuestionsResponse(BaseModel):
    """Wrapper model for list of questions - required for proper JSON schema generation"""
    questions: list[QuestionSchema] = Field(
        description="Array of exam questions generated from the document"
    )

class GeminiService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.gemini_api_key)

    def generate_questions(
        self,
        pdf_buffer: bytes,
        system_prompt: str,
        custom_prompt: str,
        schema: Optional[str] = None
    ) -> list[dict]:
        """
        Generate exam questions from PDF using Gemini API with structured output.

        Args:
            pdf_buffer: The PDF file content as bytes
            system_prompt: System-level instructions for question generation
            custom_prompt: User-specific instructions for question generation
            schema: (IGNORED) Legacy parameter kept for API compatibility.
                    Structured output enforces schema via Pydantic models.

        Returns:
            List of processed question dictionaries matching frontend Question interface
        """

        # Combine prompts
        prompt = f"""
{system_prompt}

{custom_prompt}
"""

        # Note: The 'schema' parameter is ignored. With structured output,
        # the response format is enforced via response_json_schema and Pydantic models.
        # Adding textual schema instructions would be redundant and potentially confusing.

        try:
            # Extract text from PDF
            logger.info("Extracting text from PDF...")
            pdf_text = pdf_service.extract_text(pdf_buffer)
            pdf_metadata = pdf_service.get_pdf_metadata(pdf_buffer)

            logger.info(f"PDF extraction complete: {pdf_metadata.get('page_count', 0)} pages, "
                       f"{len(pdf_text)} characters")

            # Combine prompt with extracted PDF text
            full_prompt = f"""{prompt}

DOCUMENT CONTENT:
{pdf_text}
"""

            # Generate content
            logger.info(f"Sending request to Gemini API with {len(full_prompt)} characters")

            # Note: By default, generate_content waits for the full response (no stream=True)
            response = self.client.models.generate_content(
                model=settings.gemini_model,
                contents=full_prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_json_schema": QuestionsResponse.model_json_schema()
                }
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

            # Parse and validate JSON response using Pydantic model
            try:
                # Validate response against schema
                validated_response = QuestionsResponse.model_validate_json(json_string)
                raw_questions = [q.model_dump() for q in validated_response.questions]
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON from Gemini: {e}. Raw response: {text_response[:200]}...")
                raise ValueError(f"Gemini returned invalid JSON: {str(e)}")
            except Exception as e:
                logger.error(f"Failed to validate response against schema: {e}")
                # Fallback: try manual parsing for backward compatibility
                try:
                    response_data = json.loads(json_string)
                    if isinstance(response_data, dict) and "questions" in response_data:
                        raw_questions = response_data["questions"]
                    elif isinstance(response_data, list):
                        raw_questions = response_data
                    else:
                        raise ValueError("Gemini response does not match expected structure")
                except Exception as fallback_error:
                    logger.error(f"Fallback parsing also failed: {fallback_error}")
                    raise ValueError(f"Failed to parse Gemini response: {str(e)}")

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
