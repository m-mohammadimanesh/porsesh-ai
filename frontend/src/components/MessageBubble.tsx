'use client';

import { useState } from 'react';
import { Message } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';

function CodeBlock({ language, code }: { language: string, code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden bg-[#0d1117] dark:bg-slate-950 border border-slate-800/80 shadow-md font-mono select-text" dir="ltr">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 dark:bg-slate-900 border-b border-slate-800/80 select-none">
        <span className="text-xs font-semibold text-slate-400 lowercase tracking-wide">{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors bg-slate-800/50 hover:bg-slate-700/50 px-2.5 py-1 rounded-md"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-left">
        <pre className="text-[13px] leading-relaxed text-slate-50 selection:bg-blue-500/30 m-0 p-0 bg-transparent border-0 shadow-none">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const rawText = message.text.replace(/\n{3,}/g, '\n\n');
  
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} py-1`}>
      <div 
        className={`max-w-[92%] sm:max-w-[96%] md:max-w-[88%] lg:max-w-[82%] px-5 py-4 rounded-3xl shadow-sm text-[15px] leading-relaxed transition-all ${
          isUser 
            ? 'bg-blue-600 text-white rounded-br-sm shadow-blue-500/20' 
            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-200/60 dark:border-slate-700/60 shadow-slate-200/20 dark:shadow-none'
        }`}
        dir="auto"
      >
        <div className="markdown-body break-words w-full overflow-x-hidden">
          <ReactMarkdown
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeKatex]}
            components={{
              p: ({node, ...props}) => <p className="my-1.5 leading-relaxed" {...props} />,
              a: ({node, ...props}) => <a className="text-blue-600 dark:text-blue-400 font-medium hover:underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 space-y-1 marker:text-slate-400 dark:marker:text-slate-500" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2 space-y-1 marker:text-slate-400 dark:marker:text-slate-500 font-medium" {...props} />,
              li: ({node, ...props}) => <li className="pl-1" {...props} />,
              blockquote: ({node, ...props}) => (
                <blockquote className="border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 text-slate-600 dark:text-slate-300 italic my-4 px-4 py-3 rounded-r-xl shadow-sm" {...props} />
              ),
              hr: ({node, ...props}) => <hr className="my-6 border-t border-slate-200 dark:border-slate-700" {...props} />,
              table: ({node, ...props}) => (
                <div className="my-4 w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" dir="ltr">
                  <table className="w-full text-sm text-left border-collapse" {...props} />
                </div>
              ),
              thead: ({node, ...props}) => <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold" {...props} />,
              tbody: ({node, ...props}) => <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50" {...props} />,
              tr: ({node, ...props}) => <tr className="even:bg-slate-50/50 dark:even:bg-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors" {...props} />,
              th: ({node, ...props}) => <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-medium" {...props} />,
              td: ({node, ...props}) => <td className="p-3" {...props} />,
              pre: ({node, ...props}) => <>{props.children}</>,
              code: ({node, className, children, ...props}) => {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match && !className?.includes('language-');
                
                if (isInline) {
                  return (
                    <code className="bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded-md text-[0.9em] font-mono tracking-tight font-medium" dir="ltr" {...props}>
                      {children}
                    </code>
                  );
                }

                return <CodeBlock language={match ? match[1] : 'text'} code={String(children).replace(/\n$/, '')} />;
              },
              h1: ({node, ...props}) => <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-4" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-5 mb-3" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2" {...props} />,
            }}
          >
            {rawText}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
