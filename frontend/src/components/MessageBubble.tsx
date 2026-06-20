import { Message } from '@/types';

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
        <div className="whitespace-pre-wrap">{message.text}</div>
      </div>
    </div>
  );
}
