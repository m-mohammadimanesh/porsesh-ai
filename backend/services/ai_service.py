import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

if API_KEY and API_KEY != "your_key_here":
    client = genai.Client(api_key=API_KEY)
else:
    client = None

def generate_answer(query: str, context: list[str]) -> str:
    if client is None:
        return f"AI service not configured yet. Your question was: {query}"

    context_text = "\n\n".join(context)
    prompt = f"""
You are an intelligent assistant. Use the following context to answer the user's question.
If the answer is not in the context, just use your general knowledge, but prioritize the context.

Context:
{context_text}

User Question:
{query}
"""
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"Error communicating with AI service: {e}"
