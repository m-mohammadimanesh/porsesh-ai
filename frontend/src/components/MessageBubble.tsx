import { Message } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const rawText = message.text.replace(/\n{3,}/g, '\n\n');
  
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} py-1`}>
      <div 
        className={`max-w-[92%] sm:max-w-[82%] px-5 py-4 rounded-3xl shadow-sm text-[15px] leading-relaxed transition-all ${
          isUser 
            ? 'bg-blue-600 text-white rounded-br-sm shadow-blue-500/20' 
            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-200/60 dark:border-slate-700/60 shadow-slate-200/20 dark:shadow-none'
        }`}
        dir="auto"
      >
        <div className="markdown-body break-words
          [&_pre]:bg-slate-900 [&_pre]:text-slate-50 [&_pre]:dark:bg-slate-950 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:text-sm
          [&_code]:bg-black/5 [&_code]:dark:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-[0.9em]
          [&_pre>code]:bg-transparent [&_pre>code]:p-0 [&_pre>code]:text-[inherit]
          [&_blockquote]:border-s-4 [&_blockquote]:border-slate-300 [&_blockquote]:dark:border-slate-600 [&_blockquote]:ps-4 [&_blockquote]:italic [&_blockquote]:my-3">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {rawText}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
