"""
Quick script to verify google-genai API types and parameters.
Run this to see if IntelliSense and type checking work correctly.
"""

from google import genai
from google.genai import types

# This should show type hints and autocomplete in VS Code
def test_types():
    # HttpOptions - hover to see all parameters
    http_options = types.HttpOptions(
        timeout=600,  # IntelliSense should show this is valid
        # Try typing more here and Ctrl+Space to see other options:
        # api_version, headers, client_args, async_client_args, etc.
    )

    # Client - hover to see constructor signature
    client = genai.Client(
        api_key="fake-key-for-testing",
        http_options=http_options,
        # IntelliSense shows: api_key, vertexai, project, location, http_options
    )

    # GenerateContentConfig - see all available config options
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        max_output_tokens=65536,
        # Try Ctrl+Space here to see: temperature, top_p, top_k, etc.
    )

    print("✅ All imports successful!")
    print(f"✅ HttpOptions type: {type(http_options)}")
    print(f"✅ Client type: {type(client)}")
    print(f"✅ Config type: {type(config)}")

    # This will show the actual method signature
    # Uncomment to see what parameters generate_content accepts:
    # client.models.generate_content(
    #     model="gemini-3-pro-preview",
    #     contents="test",
    #     config=config,
    #     # If you add invalid params here, VS Code will underline them in red
    # )

if __name__ == "__main__":
    test_types()
