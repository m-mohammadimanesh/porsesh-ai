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

def query_similar_chunks(query: str, session_id: str, n_results: int = 5) -> list[str]:
    if not collection:
        return []
        
    try:
        results = collection.query(
            query_texts=[query],
            n_results=n_results,
            where={"session_id": session_id}
        )
        if results['documents'] and len(results['documents']) > 0:
            docs = results['documents'][0]
            metas = results['metadatas'][0] if 'metadatas' in results and results['metadatas'] else [{}] * len(docs)
            
            formatted_chunks = []
            for doc, meta in zip(docs, metas):
                source = meta.get('source', 'Unknown File')
                formatted = f"---\nSOURCE DOCUMENT: \"{source}\"\n{doc}\n---"
                formatted_chunks.append(formatted)
                
            return formatted_chunks
    except Exception as e:
        print(f"Error querying ChromaDB: {e}")
        
    return []

def delete_file(session_id: str, source: str):
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
    if not collection:
        return
    try:
        collection.delete(
            where={"session_id": session_id}
        )
    except Exception as e:
        print(f"Error clearing session from ChromaDB: {e}")
