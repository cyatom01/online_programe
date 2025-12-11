import React from 'react';
import { Message, MessageRole } from '../types';
import { User, Bot, Loader2 } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === MessageRole.User;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-indigo-600' : 'bg-emerald-600'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
           <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
          }`}>
            {message.text}
          </div>
          {message.isStreaming && (
             <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                <Loader2 size={10} className="animate-spin" /> Generating...
             </div>
          )}
        </div>
      </div>
    </div>
  );
};