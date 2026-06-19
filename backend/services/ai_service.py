import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

# Using gemini-1.5-flash as the default fast model
model = genai.GenerativeModel('gemini-1.5-flash')

def generate_answer(query: str, context: list[str]) -> str:
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
