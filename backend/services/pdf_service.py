import io
import re
import unicodedata

import pdfplumber


def normalize_rtl_line(line: str) -> str:
    """Normalize visual RTL text to logical order.
    
    When pdfplumber extracts text from Persian/Arabic PDFs, characters may appear
    in visual right-to-left order using Arabic Presentation Forms. This function:
    1. Detects presentation form characters
    2. Reverses the visual sequence to restore logical order
    3. Normalizes presentation forms to standard Unicode (NFKC)
    4. Re-reverses embedded LTR sequences (digits, English words, dates)
    """
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


def extract_pages_from_pdf(file_bytes: bytes) -> list[dict]:
    """Extract text from PDF with per-page tracking.
    
    Returns a list of dicts, each containing:
        - page: the 1-indexed page number
        - text: the cleaned, RTL-normalized text content of that page
    
    Empty pages are excluded from the results.
    """
    pages = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            page_text = page.extract_text(layout=True)
            if page_text:
                # Process line-by-line: normalize RTL text and skip empty layout rows
                reconstructed_lines = []
                for line in page_text.split("\n"):
                    if line.strip():  # Skip blank/whitespace lines
                        reconstructed_lines.append(normalize_rtl_line(line))
                if reconstructed_lines:
                    pages.append({
                        "page": page_num,
                        "text": "\n".join(reconstructed_lines)
                    })
    return pages


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF as a single string.
    
    This is the legacy interface used by older callers. For new code,
    prefer extract_pages_from_pdf() which preserves page numbers.
    """
    pages = extract_pages_from_pdf(file_bytes)
    return "\n\n".join(p["text"] for p in pages)


def chunk_pages(pages: list[dict], chunk_size: int = 1000, overlap: int = 200) -> list[dict]:
    """Smart paragraph-aware chunking with page tracking.
    
    Instead of blindly splitting at character boundaries, this function:
    1. Splits text into paragraphs (by blank lines or single newlines)
    2. Merges paragraphs into chunks up to chunk_size characters
    3. Tracks which page(s) each chunk spans
    4. Uses sentence-boundary-aware overlap for continuity
    
    Returns a list of dicts, each containing:
        - text: the chunk content
        - pages: human-readable page label (e.g., "1" or "1-2")
        - start_page: first page number in this chunk
        - end_page: last page number in this chunk
    """
    if not pages:
        return []
    
    # Build a flat list of (page_num, paragraph_text) units
    paragraphs = []
    for page_data in pages:
        page_num = page_data["page"]
        text = page_data["text"]
        
        # Split by blank lines to get natural paragraphs
        page_paragraphs = re.split(r'\n\s*\n', text)
        for para in page_paragraphs:
            para = para.strip()
            if para:
                paragraphs.append({"page": page_num, "text": para})
    
    if not paragraphs:
        return []
    
    # Merge paragraphs into chunks respecting size limits
    chunks = []
    current_text = ""
    current_pages = set()
    
    for para in paragraphs:
        candidate_length = len(current_text) + len(para["text"]) + 2  # +2 for "\n\n" separator
        
        if current_text and candidate_length > chunk_size:
            # Current chunk is full — save it
            sorted_pages = sorted(current_pages)
            page_label = str(sorted_pages[0]) if len(sorted_pages) == 1 else f"{sorted_pages[0]}-{sorted_pages[-1]}"
            
            chunks.append({
                "text": current_text,
                "pages": page_label,
                "start_page": sorted_pages[0],
                "end_page": sorted_pages[-1],
            })
            
            # Start new chunk with overlap for continuity
            if overlap > 0 and len(current_text) > overlap:
                overlap_text = current_text[-overlap:]
                # Try to start overlap at a sentence boundary
                sentence_break = overlap_text.find('. ')
                if sentence_break == -1:
                    sentence_break = overlap_text.find('.\n')
                if 0 <= sentence_break < len(overlap_text) - 10:
                    overlap_text = overlap_text[sentence_break + 2:]
                
                current_text = overlap_text + "\n\n" + para["text"]
                current_pages = {sorted_pages[-1], para["page"]}
            else:
                current_text = para["text"]
                current_pages = {para["page"]}
        else:
            # Add paragraph to current chunk
            current_text = (current_text + "\n\n" + para["text"]) if current_text else para["text"]
            current_pages.add(para["page"])
    
    # Flush the last chunk
    if current_text:
        sorted_pages = sorted(current_pages)
        page_label = str(sorted_pages[0]) if len(sorted_pages) == 1 else f"{sorted_pages[0]}-{sorted_pages[-1]}"
        
        chunks.append({
            "text": current_text,
            "pages": page_label,
            "start_page": sorted_pages[0],
            "end_page": sorted_pages[-1],
        })
    
    return chunks


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """Legacy character-based chunking (kept for backward compatibility).
    
    For new code, prefer chunk_pages() which respects paragraph boundaries
    and tracks page numbers.
    """
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks
