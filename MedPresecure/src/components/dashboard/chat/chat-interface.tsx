'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, Loader2, Sparkles } from 'lucide-react';
import { submitMedicalQuery } from '@/ai/flows/medical-chat-flow';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

type Message = {
    id: string;
    role: 'user' | 'model';
    content: string;
};

export default function ChatInterface() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'model',
            content: "Hello! I'm your AI Medical Assistant. I can help answer general health questions, explain medical terms, or provide guidance on symptoms. \n\n**Please note:** I provide information, not medical diagnoses. Always consult a doctor for personal medical advice."
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages, isLoading]);


    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const newQuestion = input.trim();
        setInput('');

        // Optimistic UI update
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: newQuestion };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // Prepare history for AI context (exclude current question)
            const meaningfulHistory = messages
                .filter(m => m.id !== 'welcome') // Optionally exclude welcome message if not needed for context
                .map(m => ({ role: m.role, content: m.content }));

            const responseText = await submitMedicalQuery(meaningfulHistory, newQuestion);

            const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: responseText };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("Chat Error:", error);
            const errorMsg: Message = { id: Date.now().toString(), role: 'model', content: "I'm sorry, I encountered an error while processing your request. Please try again." };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };


    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] w-full max-w-4xl mx-auto bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 p-4 text-white flex items-center justify-between shadow-md z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-lg">AI Health Assistant</h2>
                        <p className="text-xs text-blue-100 opacity-90">Powered by Gemini 2.5 Flash</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs bg-blue-700/50 px-3 py-1 rounded-full border border-blue-400/30">
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                    <span>informational only</span>
                </div>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-6 relative bg-slate-50/50" ref={scrollAreaRef}>
                <div className="space-y-6 pb-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                "flex gap-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                                message.role === 'user' ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            {/* Avatar */}
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                message.role === 'user' ? "bg-indigo-100 text-indigo-700" : "bg-blue-100 text-blue-700"
                            )}>
                                {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                            </div>

                            {/* Bubble */}
                            <div className={cn(
                                "rounded-2xl px-5 py-3.5 max-w-[85%] shadow-sm text-sm leading-relaxed",
                                message.role === 'user'
                                    ? "bg-indigo-600 text-white rounded-tr-none"
                                    : "bg-white border border-gray-100 text-gray-800 rounded-tl-none prose prose-sm prose-blue max-w-none"
                            )}>
                                {message.role === 'model' ? (
                                    <ReactMarkdown
                                        components={{
                                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />,
                                            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                ) : (
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-4 w-full animate-in fade-in slide-in-from-bottom-2">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-sm">
                                <Bot size={20} />
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-white border-t">
                <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a health question (e.g., 'What are generic alternatives for Metformin?')..."
                        className="min-h-[60px] max-h-[150px] pr-12 resize-none py-3 shadow-none border-gray-200 focus-visible:ring-blue-500 rounded-xl bg-gray-50 focus:bg-white transition-colors"
                        rows={1}
                    />
                    <Button
                        onClick={() => handleSubmit()}
                        disabled={!input.trim() || isLoading}
                        className={cn(
                            "absolute right-2 bottom-2 rounded-lg w-10 h-10 p-0 transition-all duration-200 shadow-sm",
                            input.trim() ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-200 text-gray-400 hover:bg-gray-200"
                        )}
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-3">
                    AI can make mistakes. Consider checking important information.
                </p>
            </div>
        </div>
    );
}
