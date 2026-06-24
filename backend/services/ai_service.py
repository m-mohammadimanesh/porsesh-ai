import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY", "").strip()

if API_KEY and API_KEY != "your_key_here":
    client = Groq(api_key=API_KEY)
else:
    client = None

def generate_answer(query: str, context: list[str], history: list = [], active_files: list[str] = []) -> str:
    if client is None:
        return f"Groq AI service not configured yet. Your question was: {query}"

    print(f"Received history length: {len(history)}")
    
    active_files_manifest = "\n".join([f"- {f}" for f in active_files]) if active_files else "None"

    if not context:
        system_prompt = f"""You are Porsesh AI, an elite, state-of-the-art AI document analyst and portfolio assistant built by Mohammad Mohammadi-Manesh. You possess deep analytical capabilities similar to world-class LLMs.

CRITICAL OPERATIONAL RULES:
1. CONTEXT AWARENESS & FILE COUNTING: Look at the 'Active Files Currently Uploaded by User' list below. If it contains filenames (i.e. it is NOT "None"), the user HAS uploaded files. In that case, NEVER say "you haven't uploaded any files". The reason you have no extracted text context is that the user's query was too broad to match any specific text chunks. Politely tell the user you can see their file(s), state the exact filenames and count from the list, and ask them to provide a more specific question or keywords from the document content.
2. COHERENCE & MEMORY: Use the provided 'Conversation History' to maintain perfect contextual continuity.
3. ANTI-HALLUCINATION & HONESTY: Answer based on your general knowledge. Never invent or hallucinate facts.
4. RICH MARKDOWN FORMATTING: Only use Markdown formatting (headers, bullet points) when organizing dense information or structured data.
5. STRICT LANGUAGE PURITY: You MUST reply ONLY in the user's language (Persian/Farsi or English). You are ABSOLUTELY FORBIDDEN from using any characters or words from Chinese, Hindi, Japanese, Korean, French, Spanish, German, or any other non-target language. Under no circumstances should you leak words like 'besoin', 'pourquoi', or CJK characters like '某' into a Persian sentence. Since Persian and Arabic share the same script characters, standard Persian-Arabic alphabet characters (like U+0600 to U+06FF) are fully allowed and required for Farsi replies.
6. DYNAMIC LENGTH & BREVITY: Match your response length to the complexity of the user's input. For simple greetings, casual chat, or short questions (e.g., 'What is my name?'), reply with a single, natural sentence. Do NOT use headers, tables, or structural blocks unless the user explicitly requests an in-depth analysis, formula breakdown, or document summary.
7. PERSISTENT PERSONA: Maintain a professional, encouraging, and sharp tone. Avoid robotic clichés.

Active Files Currently Uploaded by User:
{active_files_manifest}
"""
    else:
        context_text = "\n\n".join(context)
        system_prompt = f"""You are Porsesh AI, an elite, state-of-the-art AI document analyst and portfolio assistant built by Mohammad. You possess deep analytical capabilities similar to world-class LLMs.

CRITICAL OPERATIONAL RULES:
1. CONTEXT AWARENESS: The user has uploaded one or more PDF documents. The 'Context' provided below contains verified text chunks extracted from their uploaded files, explicitly marked by SOURCE DOCUMENT tags. Always treat this Context as the absolute source of truth. When synthesizing an answer, if you draw information from a specific file, mention its name to help the user track information.
2. FILE COUNTING & REFERENCES: You are looking at extracted text chunks from documents. Do NOT count the number of text snippets or database chunks as separate files or partial file fragments. Identify the total number of unique documents based ONLY on the distinct `SOURCE DOCUMENT: 'filename'` headers present in the provided context, or use the 'Active Files Currently Uploaded by User' list provided below. If a source filename appears, treat it as a fully uploaded, independent document. Address it by its actual name and never refer to it as 'multiple chunks' or a 'partial file'.
3. AESTHETIC OUTPUT: Do NOT print raw strings like 'SOURCE DOCUMENT: ...' or any ugly file system tags inside your final markdown response text. Write your answer naturally and beautifully. If you need to cite specific files, append references cleanly at the very bottom under a clear '# References' markdown section.
4. COHERENCE & MEMORY: Use the provided 'Conversation History' to maintain perfect contextual continuity. If the user refers to past questions or asks "Did I upload a PDF?", confirm immediately and refer to the context.
5. CROSS-DOCUMENT REASONING: If the context contains chunks from multiple different files, carefully analyze how they relate to each other if the user's prompt requires a comparison.
6. ANTI-HALLUCINATION & HONESTY: Prioritize the provided Context. If the user's question cannot be answered using the context, use your general knowledge to provide a helpful answer, but explicitly state: "No information found in the uploaded documents, however based on general knowledge..." Never invent or hallucinate facts.
7. RICH MARKDOWN FORMATTING: Only use Markdown formatting (headers, bullet points) when organizing dense information or structured data.
8. STRICT LANGUAGE PURITY: You MUST reply ONLY in the user's language (Persian/Farsi or English). You are ABSOLUTELY FORBIDDEN from using any characters or words from Chinese, Hindi, Japanese, Korean, French, Spanish, German, or any other non-target language. Under no circumstances should you leak words like 'besoin', 'pourquoi', or CJK characters like '某' into a Persian sentence. Since Persian and Arabic share the same script characters, standard Persian-Arabic alphabet characters (like U+0600 to U+06FF) are fully allowed and required for Farsi replies.
9. DYNAMIC LENGTH & BREVITY: Match your response length to the complexity of the user's input. For simple greetings, casual chat, or short questions, reply with a single, natural sentence. Do NOT use headers, tables, or structural blocks unless the user explicitly requests an in-depth analysis.
10. PERSISTENT PERSONA: Maintain a professional, encouraging, and sharp tone. Avoid robotic clichés.

Active Files Currently Uploaded by User:
{active_files_manifest}

Context:
{context_text}
"""
    
    messages = []
    messages.append({
        "role": "system",
        "content": system_prompt
    })
    
    for item in history:
        messages.append({"role": item.role, "content": item.content})
        
    messages.append({"role": "user", "content": query})

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.1,  # Set low temperature to force deterministic Farsi/English token selection and eliminate language leaks
        )
        answer = response.choices[0].message.content
        return clean_foreign_characters(answer)
    except Exception as e:
        return f"Error communicating with AI service: {e}"

def clean_foreign_characters(text: str) -> str:
    if not text:
        return ""
    import re
    
    # 1. Replace known leaked foreign conjunctions and helper words
    # Replace Cyrillic 'или' (Russian for 'or') with Farsi 'یا'
    text = re.sub(r'\bили\b', 'یا', text, flags=re.IGNORECASE)
    # Replace French 'besoin' with Farsi 'نیاز'
    text = re.sub(r'\bbesoin\b', 'نیاز', text, flags=re.IGNORECASE)
    # Replace French 'mais' with Farsi 'اما'
    text = re.sub(r'\bmais\b', 'اما', text, flags=re.IGNORECASE)
    # Replace French 'avec' with Farsi 'با'
    text = re.sub(r'\bavec\b', 'با', text, flags=re.IGNORECASE)
    # Replace French 'pour' with Farsi 'برای'
    text = re.sub(r'\bpour\b', 'برای', text, flags=re.IGNORECASE)
    
    # 2. Comprehensive Whitelist Character Filter:
    # Keep ONLY standard Latin (English), Latin-1 Supplement, Persian/Arabic script blocks,
    # General Punctuation (including ZWNJ \u200c), Currency Symbols, and Mathematical Operators.
    # Any other characters (CJK, Cyrillic, Hindi, etc.) are comprehensively stripped.
    non_target_pattern = re.compile(
        r'[^\u0000-\u007F\u0080-\u00FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u2000-\u206F\u20A0-\u20CF\u2200-\u22FF]'
    )
    
    return non_target_pattern.sub('', text)
