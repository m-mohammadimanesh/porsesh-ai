import io
import pdfplumber
import unicodedata
import re

def normalize_rtl_line(line: str) -> str:
    if not line:
        return ""
        
    # Check if this line contains Arabic Presentation Forms
    # U+FB50 to U+FDFF and U+FE70 to U+FEFF are the presentation forms
    has_presentation_forms = any(0xFB50 <= ord(c) <= 0xFDFF or 0xFE70 <= ord(c) <= 0xFEFF for c in line)
    if not has_presentation_forms:
        return line
        
    # 1. Reverse the visual character sequence to restore logical right-to-left character flow
    reversed_line = line[::-1]
    
    # 2. Normalize to NFKC to convert presentation form glyphs to standard Unicode Arabic/Persian letters
    normalized_line = unicodedata.normalize('NFKC', reversed_line)
    
    # 3. Re-reverse any LTR sequences (like numbers, dates, English words) to their standard order
    # LTR pattern matches contiguous sequence of LTR characters: digits, English letters, and typical punctuation/symbols in digits/dates
    # e.g., 1404-1405, 19.92, 901, 20/20, etc.
    ltr_pattern = re.compile(r'[a-zA-Z0-9.,\-/:+%#@!^&*()]+')
    
    def restore_ltr(match):
        return match.group(0)[::-1]
        
    return ltr_pattern.sub(restore_ltr, normalized_line)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text(layout=True)
            if page_text:
                # Process line-by-line to correct visual RTL text direction
                reconstructed_lines = []
                for line in page_text.split("\n"):
                    reconstructed_lines.append(normalize_rtl_line(line))
                text += "\n".join(reconstructed_lines) + "\n\n"
    return text

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks
