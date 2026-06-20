import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY", "").strip()

if API_KEY and API_KEY != "your_key_here":
    client = Groq(api_key=API_KEY)
else:
    client = None

def generate_answer(query: str, context: list[str], history: list = []) -> str:
    if client is None:
        return f"Groq AI service not configured yet. Your question was: {query}"

    context_text = "\n\n".join(context)
    prompt = f"""
You are an intelligent assistant. Use the following context to answer the user's question.
If the answer is not in the context, just use your general knowledge, but prioritize the context.

Context:
{context_text}

User Question:
{query}
"""
    
    messages = []
    messages.append({
        "role": "system",
        "content": "You are Porsesh AI, an intelligent assistant."
    })
    
    for item in history:
        messages.append({"role": item.role, "content": item.content})
        
    messages.append({"role": "user", "content": prompt})

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error communicating with AI service: {e}"
