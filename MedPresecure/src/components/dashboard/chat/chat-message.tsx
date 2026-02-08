'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
    role: 'user' | 'model';
    content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
    const isUser = role === 'user';

    return (
        <div
            className={cn(
                "flex w-full gap-4 p-4 mb-4 rounded-lg",
                isUser ? "bg-blue-50 flex-row-reverse" : "bg-white border shadow-sm"
            )}
        >
            <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className={isUser ? "bg-blue-600 text-white" : "bg-green-600 text-white"}>
                    {isUser ? <User size={16} /> : <Bot size={16} />}
                </AvatarFallback>
            </Avatar>

            <div className={cn("flex-1 space-y-2 overflow-hidden", isUser ? "text-right" : "text-left")}>
                <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
