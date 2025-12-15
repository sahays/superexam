import unittest
from unittest.mock import MagicMock, patch
import json
import sys
import os

# Add processing-service to path so we can import app
sys.path.append(os.path.abspath('processing-service'))

from app.services.gemini_service import GeminiService
from jsonschema import ValidationError

class TestGeminiService(unittest.TestCase):
    @patch('app.services.gemini_service.genai')
    @patch('app.services.gemini_service.settings')
    @patch("builtins.open", new_callable=unittest.mock.mock_open, read_data='{"type": "array"}')
    def test_generate_questions_success(self, mock_file, mock_settings, mock_genai):
        # Setup mock
        mock_settings.gemini_api_key = "fake_key"
        mock_settings.gemini_model = "fake_model"
        
        mock_model = MagicMock()
        mock_genai.GenerativeModel.return_value = mock_model
        
        # Mock response with NEW schema structure
        mock_response = MagicMock()
        mock_response.parts = [True] # Just needs to be truthy
        mock_response.text = json.dumps([
            {
                "questionText": "Q1",
                "options": [{"index": "A", "text": "Option A"}, {"index": "B", "text": "Option B"}],
                "correctAnswer": "A"
            },
            {
                "questionText": "Q2",
                "options": [{"index": "A", "text": "Option C"}, {"index": "B", "text": "Option D"}],
                "correctAnswer": "B"
            }
        ])
        mock_model.generate_content.return_value = mock_response
        
        service = GeminiService()
        questions = service.generate_questions(b"pdf_data", "prompt", "custom_prompt")
        
        self.assertEqual(len(questions), 2)
        self.assertTrue("id" in questions[0])
        self.assertTrue(questions[0]["id"].startswith("q-"))
        self.assertEqual(questions[0]["questionText"], "Q1")
        
        # Verify choices transformation (direct mapping now)
        self.assertEqual(len(questions[0]["choices"]), 2)
        self.assertEqual(questions[0]["choices"][0]["text"], "Option A")
        self.assertEqual(questions[0]["choices"][0]["index"], "A")
        
        # Verify correctAnswers transformation (string "A" -> list ["A"])
        self.assertEqual(questions[0]["correctAnswers"], ["A"])
        
        # Verify generation_config was passed
        args, kwargs = mock_model.generate_content.call_args
        self.assertIn('generation_config', kwargs)
        config = kwargs['generation_config']
        self.assertEqual(config['response_mime_type'], "application/json")
        self.assertIn("response_schema", config)

    @patch('app.services.gemini_service.genai')
    @patch('app.services.gemini_service.settings')
    @patch("builtins.open", new_callable=unittest.mock.mock_open, read_data='{"type": "array", "items": {"type": "object"}}')
    def test_generate_questions_invalid_item(self, mock_file, mock_settings, mock_genai):
        # Setup mock
        mock_settings.gemini_api_key = "fake_key"
        mock_model = MagicMock()
        mock_genai.GenerativeModel.return_value = mock_model
        
        # Mock response with strings instead of dicts (violates schema)
        mock_response = MagicMock()
        mock_response.parts = [True]
        mock_response.text = json.dumps(["string question 1", "string question 2"])
        mock_model.generate_content.return_value = mock_response
        
        service = GeminiService()
        
        with self.assertRaises(ValueError) as cm:
            service.generate_questions(b"pdf_data", "prompt", "custom_prompt")
        
        self.assertIn("Gemini response did not match expected schema", str(cm.exception))


if __name__ == '__main__':
    unittest.main()
