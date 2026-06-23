'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import ChatWindow from '@/components/ChatWindow';
import ChatInput from '@/components/ChatInput';
import PDFUploader from '@/components/PDFUploader';
import Footer from '@/components/Footer';
import { sendMessage, clearSession, checkHealth, deleteFile } from '@/services/api';
import { Message } from '@/types';

const INITIAL_MESSAGE: Message = {
  id: 'init-1',
  text: 'Hello! I am Porsesh AI, a professional AI chatbot. You can chat with me or upload PDF documents and ask questions about them.',
  sender: 'ai'
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{id: string, name: string}[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [systemMessage, setSystemMessage] = useState<string | null>(null);

  useEffect(() => {
    // Generate simple session ID
    const newSessionId = Math.random().toString(36).substring(7);
    setSessionId(newSessionId);
    
    // Check system dark mode preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Ping backend on load to wake it up
    const wakeBackend = async () => {
      const timer = setTimeout(() => setSystemMessage("Connecting to server, please wait..."), 500);
      try {
        await checkHealth();
      } finally {
        clearTimeout(timer);
        setSystemMessage(null);
      }
    };
    wakeBackend();

    // Cleanup session on unload
    const handleBeforeUnload = () => {
      clearSession(newSessionId);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearSession(newSessionId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleDeleteFile = async (filename: string) => {
    try {
      await deleteFile(sessionId, filename);
      setUploadedFiles(prev => prev.filter(f => f.name !== filename));
    } catch (err) {
      console.error("Failed to delete file", err);
    }
  };

  const handleSendMessage = async (text: string) => {
    const history = messages
      .filter(m => m.id !== 'init-1')
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

    console.log('Sending history:', history);

    const userMessage: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendMessage(text, sessionId, history, uploadedFiles.map(f => f.name), () => {
        setSystemMessage("Retrying connection...");
      });
      setSystemMessage(null);
      const aiMessage: Message = {  
        id: (Date.now() + 1).toString(), 
        text: response.answer, 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (_error) {
      const errorMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        text: 'Error: Failed to get response from AI. Please try again.', 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 ${isDarkMode ? 'dark' : ''}`}>
      {systemMessage && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white text-center py-2 px-4 text-sm font-medium shadow-md animate-pulse">
          {systemMessage}
        </div>
      )}
      {/* Sidebar for Desktop / Hidden on mobile by default */}
      <div className={`fixed inset-y-0 left-0 z-40 w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">Porsesh AI</h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="mb-6">
            <PDFUploader 
              sessionId={sessionId}
              onUploadSuccess={(filename) => {
                setUploadedFiles(prev => {
                  if (prev.find(f => f.name === filename)) return prev;
                  return [...prev, { id: Math.random().toString(36).substring(7), name: filename }];
                });
                setSystemMessage(null);
              }} 
              onRetry={() => setSystemMessage("Retrying connection...")}
            />
          </div>
          
          {uploadedFiles.length > 0 && (
            <div className="mb-6 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Documents</p>
              {uploadedFiles.map(file => (
                <div key={file.id} className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl flex items-center justify-between gap-3 border border-blue-100 dark:border-blue-800/50 shadow-sm transition-all">
                   <div className="flex items-center gap-2 overflow-hidden">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                     <p className="text-xs text-blue-800 dark:text-blue-200 truncate" title={file.name}>{file.name}</p>
                   </div>
                   <button onClick={() => handleDeleteFile(file.name)} className="p-1 hover:bg-blue-200/50 dark:hover:bg-blue-800/50 rounded-md text-blue-600 dark:text-blue-400 transition-colors" title="Remove file">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-auto">
             <button onClick={toggleDarkMode} className="flex items-center justify-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700">
                {isDarkMode ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
                        Light Mode
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
                        Dark Mode
                    </>
                )}
             </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 lg:hidden z-10 sticky top-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          </button>
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Porsesh AI</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </header>

        <ChatWindow messages={messages} isLoading={isLoading} />
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        <Footer />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden transition-all duration-300" 
            onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
