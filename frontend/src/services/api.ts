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
    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', session_id);
    
    let lastError: Error | null = null;
    const maxRetries = 2;
    const retryDelay = 2000;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);
        
        try {
            if (attempt > 0 && onRetry) onRetry();
            
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData,
                signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error('Failed to upload PDF');
            }
            return await response.json();
        } catch (err) {
            clearTimeout(timeoutId);
            lastError = err instanceof Error ? err : new Error(String(err));
            
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }
    
    throw lastError;
}

export async function clearSession(session_id: string) {
    const response = await fetch(`${API_URL}/session/${session_id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        console.error('Failed to clear session');
    }
}

export async function sendMessage(message: string, session_id: string, history: {role: string, content: string}[] = [], onRetry?: () => void) {
    console.log('API Request History:', history);
    const response = await fetchWithRetry(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, session_id, history }),
    }, onRetry);
    
    return response.json();
}
