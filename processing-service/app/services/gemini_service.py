import json
import time
import logging
import os
import re
from typing import Optional, Callable
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from app.config import settings
from app.services.pdf_service import pdf_service

logger = logging.getLogger(__name__)

# Gemini 3 Pro limits (gemini-3-pro-preview)
MAX_OUTPUT_TOKENS = 65536  # 64k max output tokens
REQUEST_TIMEOUT = 600  # 10 minutes for large documents
PAGES_PER_BATCH = 600  # Process 600 pages at a time
MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds


class OptionSchema(BaseModel):
    index: str = Field(
        description="The identifier for this choice (e.g., 'A', 'B', 'C', 'D' or 1, 2, 3, 4)"
    )
    text: str = Field(description="The text content of this answer choice")


class QuestionSchema(BaseModel):
    questionText: str = Field(description="The complete text of the exam question")
    options: list[OptionSchema] = Field(
        description="List of possible answer choices for this question", min_length=2
    )
    correctAnswer: list[str] = Field(
        description="List of correct choice indices (e.g., ['A'] for single-select or ['A', 'C'] for multi-select)",
        min_length=1,
    )


class QuestionsResponse(BaseModel):
    """Wrapper model for list of questions - required for proper JSON schema generation"""

    questions: list[QuestionSchema] = Field(
        description="Array of exam questions generated from the document"
    )


class GeminiService:
    def __init__(self):
        # Configure HTTP options with timeout
        http_options = types.HttpOptions(
            timeout=REQUEST_TIMEOUT,
        )
        self.client = genai.Client(
            api_key=settings.gemini_api_key,
            http_options=http_options
        )

    def _split_text_by_pages(
        self, pdf_text: str, pages_per_batch: int
    ) -> list[tuple[str, int | None, int | None]]:
        """
        Split PDF text into batches by page markers.

        Args:
            pdf_text: Full PDF text with page markers (--- Page N ---)
            pages_per_batch: Number of pages per batch

        Returns:
            List of tuples (batch_text, start_page, end_page)
        """
        # Split by page markers
        page_pattern = r"--- Page (\d+) ---"
        pages = re.split(page_pattern, pdf_text)

        # pages list is: ['', '1', 'content1', '2', 'content2', ...]
        batches: list[tuple[str, int | None, int | None]] = []
        current_batch: list[str] = []
        current_start: int | None = None
        current_end: int | None = None

        i = 1  # Start after empty first element
        while i < len(pages):
            if i + 1 >= len(pages):
                break

            page_num = int(pages[i])
            page_content = pages[i + 1]

            if current_start is None:
                current_start = page_num
            current_end = page_num

            current_batch.append(f"--- Page {page_num} ---\n{page_content}")

            # Check if batch is full
            if len(current_batch) >= pages_per_batch:
                batch_text = "\n\n".join(current_batch)
                batches.append((batch_text, current_start, current_end))
                current_batch = []
                current_start = None
                current_end = None

            i += 2

        # Add remaining pages
        if current_batch:
            batch_text = "\n\n".join(current_batch)
            batches.append((batch_text, current_start, current_end))

        return batches

    def _call_gemini_with_retry(
        self,
        prompt: str,
        batch_num: int,
        total_batches: int,
        progress_callback: Optional[Callable[[str], None]] = None,
    ) -> str:
        """
        Call Gemini API with retry logic.

        Args:
            prompt: The full prompt to send
            batch_num: Current batch number (1-indexed)
            total_batches: Total number of batches
            progress_callback: Optional callback to update progress

        Returns:
            Raw JSON response text
        """
        last_error: Exception | None = None

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                if progress_callback:
                    progress_callback(
                        f"Processing batch {batch_num}/{total_batches} (attempt {attempt}/{MAX_RETRIES})"
                    )

                logger.info(
                    f"Batch {batch_num}/{total_batches}, Attempt {attempt}/{MAX_RETRIES}: Sending {len(prompt)} chars"
                )

                response = self.client.models.generate_content(
                    model=settings.gemini_model,
                    contents=prompt,
                    config={
                        "response_mime_type": "application/json",
                        "response_json_schema": QuestionsResponse.model_json_schema(),
                        "max_output_tokens": MAX_OUTPUT_TOKENS,
                    },
                )

                # Check for safety blocks or empty responses
                if not response.parts:
                    error_msg = "Gemini returned an empty response."
                    if (
                        hasattr(response, "prompt_feedback")
                        and response.prompt_feedback
                    ):
                        if response.prompt_feedback.block_reason:
                            error_msg = f"Gemini blocked the request: {response.prompt_feedback.block_reason}"
                    raise ValueError(error_msg)

                logger.info(f"Batch {batch_num}/{total_batches} completed successfully")
                return response.text

            except Exception as e:
                last_error = e
                logger.warning(
                    f"Batch {batch_num}/{total_batches}, Attempt {attempt}/{MAX_RETRIES} failed: {e}"
                )

                if attempt < MAX_RETRIES:
                    delay = RETRY_DELAY * (2 ** (attempt - 1))  # Exponential backoff
                    logger.info(f"Retrying in {delay} seconds...")
                    time.sleep(delay)
                else:
                    logger.error(
                        f"Batch {batch_num}/{total_batches} failed after {MAX_RETRIES} attempts"
                    )

        # This should never happen as we always catch exceptions, but satisfies type checker
        if last_error is None:
            raise RuntimeError(f"Batch {batch_num}/{total_batches} failed without capturing error")
        raise last_error

    def _parse_gemini_response(self, text_response: str) -> list[dict]:
        """
        Parse and validate Gemini JSON response.

        Args:
            text_response: Raw text response from Gemini

        Returns:
            List of question dictionaries
        """
        logger.info(f"Parsing Gemini response ({len(text_response)} chars)")

        # Clean response (remove markdown code blocks if present)
        json_string = text_response.replace("```json", "").replace("```", "").strip()

        if not json_string:
            raise ValueError("Gemini returned empty text content")

        # Parse and validate JSON response using Pydantic model
        try:
            # Validate response against schema
            validated_response = QuestionsResponse.model_validate_json(json_string)
            return [q.model_dump() for q in validated_response.questions]
        except json.JSONDecodeError as e:
            logger.error(
                f"Failed to parse JSON from Gemini: {e}. Raw response: {text_response[:200]}..."
            )
            raise ValueError(f"Gemini returned invalid JSON: {str(e)}")
        except Exception as e:
            logger.error(f"Failed to validate response against schema: {e}")
            # Fallback: try manual parsing for backward compatibility
            try:
                response_data = json.loads(json_string)
                if isinstance(response_data, dict) and "questions" in response_data:
                    return response_data["questions"]
                elif isinstance(response_data, list):
                    return response_data
                else:
                    raise ValueError(
                        "Gemini response does not match expected structure"
                    )
            except Exception as fallback_error:
                logger.error(f"Fallback parsing also failed: {fallback_error}")
                raise ValueError(f"Failed to parse Gemini response: {str(e)}")

    def generate_questions(
        self,
        pdf_buffer: bytes,
        system_prompt: str,
        custom_prompt: str,
        schema: Optional[str] = None,
        progress_callback: Optional[Callable[[str], None]] = None,
    ) -> list[dict]:
        """
        Generate exam questions from PDF using Gemini API with structured output.
        Supports batching for large documents with automatic retry on failure.

        Args:
            pdf_buffer: The PDF file content as bytes
            system_prompt: System-level instructions for question generation
            custom_prompt: User-specific instructions for question generation
            schema: (IGNORED) Legacy parameter kept for API compatibility
            progress_callback: Optional callback function to report progress updates

        Returns:
            List of processed question dictionaries matching frontend Question interface
        """

        # Combine prompts
        prompt = f"""
{system_prompt}

{custom_prompt}
"""

        try:
            # Extract text from PDF
            logger.info("Extracting text from PDF...")
            if progress_callback:
                progress_callback("Extracting text from PDF...")

            pdf_text = pdf_service.extract_text(pdf_buffer)
            pdf_metadata = pdf_service.get_pdf_metadata(pdf_buffer)
            page_count = pdf_metadata.get("page_count", 0)

            logger.info(
                f"PDF extraction complete: {page_count} pages, {len(pdf_text)} characters"
            )

            # Determine if batching is needed
            use_batching = page_count > PAGES_PER_BATCH

            if use_batching:
                logger.info(
                    f"Large document detected ({page_count} pages). Using batch processing with {PAGES_PER_BATCH} pages per batch"
                )
                if progress_callback:
                    progress_callback(f"Processing {page_count} pages in batches...")

                # Split into batches
                batches = self._split_text_by_pages(pdf_text, PAGES_PER_BATCH)
                logger.info(f"Split into {len(batches)} batches")

                all_questions = []
                for batch_idx, (batch_text, start_page, end_page) in enumerate(
                    batches, 1
                ):
                    logger.info(
                        f"Processing batch {batch_idx}/{len(batches)}: pages {start_page}-{end_page}"
                    )

                    # Create batch-specific prompt
                    batch_prompt = f"""{prompt}

DOCUMENT CONTENT (Pages {start_page}-{end_page}):
{batch_text}
"""

                    # Call with retry
                    text_response = self._call_gemini_with_retry(
                        prompt=batch_prompt,
                        batch_num=batch_idx,
                        total_batches=len(batches),
                        progress_callback=progress_callback,
                    )

                    # Parse batch response
                    batch_questions = self._parse_gemini_response(text_response)
                    all_questions.extend(batch_questions)

                    logger.info(
                        f"Batch {batch_idx}/{len(batches)} added {len(batch_questions)} questions (total: {len(all_questions)})"
                    )

                raw_questions = all_questions

            else:
                logger.info(
                    f"Small document ({page_count} pages). Processing in single request"
                )
                if progress_callback:
                    progress_callback(
                        f"Generating questions from {page_count} pages..."
                    )

                # Combine prompt with extracted PDF text
                full_prompt = f"""{prompt}

DOCUMENT CONTENT:
{pdf_text}
"""

                # Single request with retry
                text_response = self._call_gemini_with_retry(
                    prompt=full_prompt,
                    batch_num=1,
                    total_batches=1,
                    progress_callback=progress_callback,
                )

                # Parse response
                raw_questions = self._parse_gemini_response(text_response)

            logger.info(f"Successfully generated {len(raw_questions)} questions")

            # Transform and add unique IDs to questions
            processed_questions = []
            timestamp = int(time.time())

            for i, q in enumerate(raw_questions):
                if not isinstance(q, dict):
                    raise ValueError(
                        f"Gemini returned an invalid item at index {i}: expected dict, got {type(q).__name__}"
                    )

                # Parse correctAnswer list (e.g., ["A"] or ["A", "C"])
                correct_answers = q.get("correctAnswer", [])

                # Transform to match Frontend 'Question' interface
                processed_q = {
                    "id": f"q-{timestamp}-{i}",
                    "questionText": q.get("questionText", ""),
                    "correctAnswers": correct_answers,
                    "choices": q.get("options", []),
                }

                processed_questions.append(processed_q)

            return processed_questions

        except Exception as e:
            logger.error(f"Error in generate_questions: {e}")
            raise e


gemini_service = GeminiService()
