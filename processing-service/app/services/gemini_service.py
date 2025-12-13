import json
import time
from typing import Optional
import google.generativeai as genai
from app.config import settings


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

        # Generate content
        response = self.model.generate_content([prompt, pdf_part])
        text_response = response.text

        # Clean response (remove markdown code blocks if present)
        json_string = text_response.replace("```json", "").replace("```", "").strip()

        # Parse JSON response
        questions = json.loads(json_string)

        # Add unique IDs to questions
        timestamp = int(time.time())
        for i, q in enumerate(questions):
            q["id"] = f"q-{timestamp}-{i}"

        return questions


gemini_service = GeminiService()
