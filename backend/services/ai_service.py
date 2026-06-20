import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()

if API_KEY and API_KEY != "your_key_here":
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=API_KEY,
    )
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
        response = client.chat.completions.create(
            model="google/gemma-3-4b-it:free",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error communicating with AI service: {e}"
