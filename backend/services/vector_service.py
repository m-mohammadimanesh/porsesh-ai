import os
import chromadb
from dotenv import load_dotenv

load_dotenv()

CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")

client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
collection = client.get_or_create_collection(name="pdf_documents")

def store_chunks(chunks: list[str], source: str):
    if not chunks:
        return
    
    ids = [f"{source}_{i}" for i in range(len(chunks))]
    metadatas = [{"source": source} for _ in chunks]
    
    collection.add(
        documents=chunks,
        metadatas=metadatas,
        ids=ids
    )

def query_similar_chunks(query: str, n_results: int = 3) -> list[str]:
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    if results['documents'] and len(results['documents']) > 0:
        return results['documents'][0]
    return []
