import os
import chromadb
from dotenv import load_dotenv

load_dotenv()

CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")

if CHROMA_DB_PATH == "./chroma_db" and os.getenv("NODE_ENV", "development") == "production":
    print("CRITICAL WARNING: Using local './chroma_db' in production. This will lead to data loss on ephemeral cloud instances (Vercel/Render). Please mount a persistent volume and set CHROMA_DB_PATH.")

try:
    client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    collection = client.get_or_create_collection(name="pdf_documents")
except Exception as e:
    print(f"Warning: Failed to initialize ChromaDB. Error: {e}")
    client = None
    collection = None


def store_chunks(chunks: list[dict], source: str, session_id: str):
    """Store page-aware chunks with metadata in ChromaDB.
    
    Args:
        chunks: List of dicts from chunk_pages(), each with keys:
                text, pages, start_page, end_page
        source: Original filename (e.g., "report.pdf")
        session_id: User session identifier
    """
    if not collection or not chunks:
        return
    
    ids = [f"{session_id}_{source}_{i}" for i in range(len(chunks))]
    documents = [chunk["text"] for chunk in chunks]
    metadatas = [{
        "source": source,
        "session_id": session_id,
        "pages": chunk.get("pages", ""),
        "start_page": chunk.get("start_page", 0),
        "end_page": chunk.get("end_page", 0),
    } for chunk in chunks]
    
    collection.add(
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )


def query_similar_chunks(query: str, session_id: str, active_files: list[str] = None, n_results: int = 8) -> list[str]:
    """Query similar chunks and return formatted context with source and page info.
    
    Returns up to n_results (default: 8) formatted context strings, each tagged
    with the source document name and page number for the AI to reference.
    """
    if not collection:
        return []
        
    where_clause = {"session_id": session_id}
    if active_files is not None:
        if len(active_files) == 0:
            return []  # No active files means no context to return
        elif len(active_files) == 1:
            where_clause = {"$and": [{"session_id": session_id}, {"source": active_files[0]}]}
        else:
            where_clause = {"$and": [{"session_id": session_id}, {"source": {"$in": active_files}}]}
            
    try:
        results = collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where_clause
        )
        if results['documents'] and len(results['documents']) > 0:
            docs = results['documents'][0]
            metas = results['metadatas'][0] if 'metadatas' in results and results['metadatas'] else [{}] * len(docs)
            
            formatted_chunks = []
            for doc, meta in zip(docs, metas):
                source = meta.get('source', 'Unknown File')
                pages = meta.get('pages', '')
                page_info = f" (Page {pages})" if pages else ""
                formatted = f"---\nSOURCE DOCUMENT: \"{source}\"{page_info}\n{doc}\n---"
                formatted_chunks.append(formatted)
                
            return formatted_chunks
    except Exception as e:
        print(f"Error querying ChromaDB: {e}")
        
    return []


def delete_file(session_id: str, source: str):
    """Delete all chunks for a specific file from a session."""
    if not collection:
        return
    try:
        collection.delete(
            where={
                "$and": [
                    {"session_id": session_id},
                    {"source": source}
                ]
            }
        )
    except Exception as e:
        print(f"Error deleting file from ChromaDB: {e}")


def clear_session(session_id: str):
    """Delete all chunks for an entire session."""
    if not collection:
        return
    try:
        collection.delete(
            where={"session_id": session_id}
        )
    except Exception as e:
        print(f"Error clearing session from ChromaDB: {e}")
