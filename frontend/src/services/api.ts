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

export async function uploadPDF(
    file: File,
    session_id: string,
    onProgress?: (percent: number) => void,
    onRetry?: () => void,
    retries = 1,
    delay = 3000
): Promise<any> {
    console.log('Uploading PDF with XMLHttpRequest...');
    
    const attemptUpload = () => {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('session_id', session_id);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${API_URL}/upload`);

            if (onProgress && xhr.upload) {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percent = (event.loaded / event.total) * 100;
                        // Limit to 99% during active transmission, only set 100% on successful completion
                        onProgress(Math.min(99, percent));
                    }
                });
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        if (onProgress) onProgress(100);
                        resolve(data);
                    } catch {
                        reject(new Error('Failed to parse upload response'));
                    }
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            };

            xhr.onerror = () => {
                reject(new Error('Network error during upload'));
            };

            xhr.send(formData);
        });
    };

    try {
        return await attemptUpload();
    } catch (err) {
        if (retries > 0) {
            if (onRetry) onRetry();
            await new Promise(resolve => setTimeout(resolve, delay));
            return uploadPDF(file, session_id, onProgress, onRetry, retries - 1, delay);
        }
        throw err;
    }
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
