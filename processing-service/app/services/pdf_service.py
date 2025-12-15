import io
import logging
from typing import Optional
from pypdf import PdfReader

logger = logging.getLogger(__name__)

class PDFService:
    """Service for extracting text from PDF documents"""

    def extract_text(self, pdf_buffer: bytes) -> str:
        """
        Extract text content from a PDF buffer.

        Args:
            pdf_buffer: The PDF file content as bytes

        Returns:
            Extracted text as a string

        Raises:
            ValueError: If PDF cannot be read or is empty
        """
        try:
            # Create a file-like object from bytes
            pdf_file = io.BytesIO(pdf_buffer)

            # Read PDF
            reader = PdfReader(pdf_file)

            if len(reader.pages) == 0:
                raise ValueError("PDF has no pages")

            # Extract text from all pages
            text_parts = []
            for page_num, page in enumerate(reader.pages, start=1):
                try:
                    page_text = page.extract_text()
                    if page_text and page_text.strip():
                        text_parts.append(f"--- Page {page_num} ---\n{page_text}")
                except Exception as page_error:
                    logger.warning(f"Failed to extract text from page {page_num}: {page_error}")
                    continue

            if not text_parts:
                raise ValueError("No text could be extracted from PDF")

            # Combine all pages
            full_text = "\n\n".join(text_parts)

            # Log extraction stats
            logger.info(f"Extracted {len(full_text)} characters from {len(reader.pages)} pages")
            logger.info(f"First 200 chars: {full_text[:200]}")

            return full_text

        except Exception as e:
            logger.error(f"PDF text extraction failed: {e}")
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")

    def get_pdf_metadata(self, pdf_buffer: bytes) -> dict:
        """
        Extract metadata from a PDF buffer.

        Args:
            pdf_buffer: The PDF file content as bytes

        Returns:
            Dictionary with PDF metadata (pages, title, author, etc.)
        """
        try:
            pdf_file = io.BytesIO(pdf_buffer)
            reader = PdfReader(pdf_file)

            metadata = {
                "page_count": len(reader.pages),
                "title": reader.metadata.title if reader.metadata else None,
                "author": reader.metadata.author if reader.metadata else None,
                "subject": reader.metadata.subject if reader.metadata else None,
            }

            return metadata

        except Exception as e:
            logger.error(f"Failed to extract PDF metadata: {e}")
            return {"page_count": 0, "error": str(e)}


# Singleton instance
pdf_service = PDFService()
