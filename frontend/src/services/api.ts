const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function uploadPDF(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
    });
    
    if (!response.ok) {
        throw new Error('Failed to upload PDF');
    }
    return response.json();
}

export async function sendMessage(message: string, session_id: string, history: {role: string, content: string}[] = []) {
    const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, session_id, history }),
    });
    
    if (!response.ok) {
        throw new Error('Failed to send message');
    }
    return response.json();
}
