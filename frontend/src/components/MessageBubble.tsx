import { Message } from '@/types';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
      <div 
        className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${
          isUser 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700'
        }`}
        dir="auto"
      >
        <div className="whitespace-pre-wrap break-words [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>pre]:bg-black/10 [&>pre]:dark:bg-white/10 [&>pre]:p-2 [&>pre]:rounded-md [&>code]:bg-black/10 [&>code]:dark:bg-white/10 [&>code]:px-1 [&>code]:rounded [&>h1]:text-lg [&>h1]:font-bold [&>h2]:text-base [&>h2]:font-bold [&>h3]:font-bold">
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
