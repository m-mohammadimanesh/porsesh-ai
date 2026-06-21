import os
import chromadb
from dotenv import load_dotenv

load_dotenv()

CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")

try:
    client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    collection = client.get_or_create_collection(name="pdf_documents")
except Exception as e:
    print(f"Warning: Failed to initialize ChromaDB. Error: {e}")
    client = None
    collection = None

def store_chunks(chunks: list[str], source: str, session_id: str):
    if not collection or not chunks:
        return
    
    ids = [f"{session_id}_{source}_{i}" for i in range(len(chunks))]
    metadatas = [{"source": source, "session_id": session_id} for _ in chunks]
    
    collection.add(
        documents=chunks,
        metadatas=metadatas,
        ids=ids
    )

def query_similar_chunks(query: str, session_id: str, n_results: int = 3) -> list[str]:
    if not collection:
        return []
        
    try:
        results = collection.query(
            query_texts=[query],
            n_results=n_results,
            where={"session_id": session_id}
        )
        if results['documents'] and len(results['documents']) > 0:
            return results['documents'][0]
    except Exception as e:
        print(f"Error querying ChromaDB: {e}")
        
    return []

def clear_session(session_id: str):
    if not collection:
        return
    try:
        collection.delete(
            where={"session_id": session_id}
        )
    except Exception as e:
        print(f"Error clearing session from ChromaDB: {e}")
