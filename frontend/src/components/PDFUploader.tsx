import { useState, useRef } from 'react';
import { uploadPDF } from '@/services/api';

interface PDFUploaderProps {
  onUploadSuccess: (filename: string) => void;
  sessionId: string;
  onRetry?: () => void;
}

export default function PDFUploader({ onUploadSuccess, sessionId, onRetry }: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }
    
    const MAX_SIZE_MB = 10;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum allowed size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const res = await uploadPDF(
        file,
        sessionId,
        (percent) => {
          setUploadProgress(percent);
        },
        onRetry
      );
      
      setUploadProgress(100);
      setTimeout(() => {
        onUploadSuccess(res.filename);
        setIsUploading(false);
      }, 500);
    } catch (err: unknown) {
      setIsUploading(false);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to upload PDF.');
      }
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed transition-all ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-inner' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'}`}>
      <div 
        className="w-full text-center"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className={`flex justify-center mb-4 transition-transform ${isUploading ? 'scale-90 opacity-70' : 'text-blue-500'} ${isDragging ? 'scale-110' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
        </div>
        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Upload PDF Document</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Drag and drop, or browse</p>
        
        {isUploading ? (
          <div className="w-full max-w-[200px] mx-auto">
            <div className="flex justify-between text-[11px] mb-1.5 text-blue-600 dark:text-blue-400 font-medium px-1">
              <span>{uploadProgress >= 99 ? 'Processing...' : 'Uploading...'}</span>
              <span className="font-mono">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden shadow-inner">
              <div 
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out relative overflow-hidden" 
                style={{ width: `${uploadProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-[pulse_1s_ease-in-out_infinite]"></div>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2 bg-white dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all active:scale-95"
          >
            Select File
          </button>
        )}
        
        <input 
          type="file" 
          accept="application/pdf" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleChange} 
        />
        {error && <p className="mt-4 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 py-2 px-3 rounded-md">{error}</p>}
      </div>
    </div>
  );
}
