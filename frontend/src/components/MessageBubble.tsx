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
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} my-4`}>
      <div 
        className={`max-w-[92%] sm:max-w-[82%] px-5 py-4 rounded-3xl shadow-sm text-[15px] leading-relaxed transition-all ${
          isUser 
            ? 'bg-blue-600 text-white rounded-br-sm shadow-blue-500/20' 
            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-200/60 dark:border-slate-700/60 shadow-slate-200/20 dark:shadow-none'
        }`}
        dir="auto"
      >
        <div className="break-words prose-p:my-1 prose-br:hidden prose-li:my-0
          [&>p]:my-1 [&>p:last-child]:mb-0 
          [&>ul]:list-disc [&>ul]:ps-6 [&>ul]:my-1 [&>ul:last-child]:mb-0
          [&>ol]:list-decimal [&>ol]:ps-6 [&>ol]:my-1 [&>ol:last-child]:mb-0
          [&>pre]:bg-slate-900 [&>pre]:text-slate-50 [&>pre]:dark:bg-slate-950 [&>pre]:p-4 [&>pre]:rounded-xl [&>pre]:overflow-x-auto [&>pre]:my-3 [&>pre]:text-sm
          [&>code]:bg-black/5 [&>code]:dark:bg-white/10 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded-md [&>code]:text-[0.9em]
          [&>pre>code]:bg-transparent [&>pre>code]:p-0 [&>pre>code]:text-[inherit]
          [&>h1]:text-xl [&>h1]:font-semibold [&>h1]:mb-3 [&>h1]:mt-4
          [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:mb-3 [&>h2]:mt-4
          [&>h3]:text-base [&>h3]:font-semibold [&>h3]:mb-2 [&>h3]:mt-3
          [&>blockquote]:border-s-4 [&>blockquote]:border-slate-300 [&>blockquote]:dark:border-slate-600 [&>blockquote]:ps-4 [&>blockquote]:italic [&>blockquote]:my-3">
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
