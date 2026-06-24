const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export async function checkHealth() {
    try {
        const response = await fetch(`${API_URL}/health`, { method: 'GET' });
        return response.ok;
    } catch {
        return false;
    }
}

const fetchWithRetry = async (url: string, options: RequestInit, onRetry?: () => void, retries = 1, delay = 3000): Promise<Response> => {
    try {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error('Request failed');
        return res;
    } catch (err) {
        if (retries > 0) {
            if (onRetry) onRetry();
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, onRetry, retries - 1, delay);
        }
        throw err;
    }
};

export async function uploadPDF(file: File, session_id: string, onRetry?: () => void) {
    console.log('Uploading PDF...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', session_id);
    
    const response = await fetchWithRetry(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
    }, onRetry);
    
    return response.json();
}

export async function clearSession(session_id: string) {
    const response = await fetch(`${API_URL}/session/${session_id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        console.error('Failed to clear session');
    }
}

export async function deleteFile(session_id: string, filename: string) {
    const response = await fetch(`${API_URL}/session/${session_id}/file/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        console.error('Failed to delete file');
    }
}

export async function sendMessage(message: string, session_id: string, history: {role: string, content: string}[] = [], active_files: string[] = [], onRetry?: () => void) {
    console.log('API Request History:', history);
    console.log('API Active Files:', active_files);
    const response = await fetchWithRetry(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, session_id, history, active_files }),
    }, onRetry);
    
    return response.json();
}
