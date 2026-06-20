import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

if API_KEY and API_KEY != "your_key_here":
    genai.configure(api_key=API_KEY)
    # Using gemini-1.5-flash as the default fast model
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

def generate_answer(query: str, context: list[str]) -> str:
    if model is None:
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
    response = model.generate_content(prompt)
    return response.text
