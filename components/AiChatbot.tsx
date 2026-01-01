import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, CornerDownLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateAiChatResponse } from '../services/gemini';
import { ChatMessage } from '../types';

export const AiChatbot: React.FC = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: 'Hello! How can I help you on your anime journey today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    }, [isOpen]);
    
    // Do not render the component if the user is not logged in
    if (!user) {
        return null;
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = inputValue.trim();
        if (!trimmedInput || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: trimmedInput };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const responseText = await generateAiChatResponse(messages, trimmedInput);
            const modelMessage: ChatMessage = { role: 'model', text: responseText };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Failed to get AI response", error);
            const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I couldn't connect to the AI. Please check your configuration." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* FAB */}
            <AnimatePresence>
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0, y: 50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0, y: 50, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-[8000] w-16 h-16 bg-brand-400 text-black rounded-full flex items-center justify-center shadow-2xl shadow-brand-400/20 hover:bg-white transition-colors"
                    aria-label="Open AI Assistant"
                >
                    <Bot className="w-8 h-8" />
                </motion.button>
            )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="fixed bottom-6 right-6 z-[9000] w-[calc(100vw-2rem)] max-w-md h-[70vh] max-h-[600px] bg-dark-900 border border-dark-700 rounded-xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex-shrink-0 p-4 bg-dark-800 border-b border-dark-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Bot className="w-5 h-5 text-brand-400"/> AI Assistant
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="p-2 text-zinc-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-dark-700 scrollbar-track-dark-800">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex gap-3 items-end ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'model' && (
                                        <div className="w-8 h-8 rounded-full bg-brand-400/20 flex items-center justify-center flex-shrink-0 border border-brand-400/30">
                                            <Bot className="w-5 h-5 text-brand-400"/>
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed ${
                                        msg.role === 'user'
                                        ? 'bg-brand-400 text-black font-semibold'
                                        : 'bg-dark-800 text-zinc-300'
                                    }`}>
                                        {/* Basic markdown for bold and lists */}
                                        <div className="prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />
                                    </div>
                                </div>
                            ))}
                             {isLoading && (
                                <div className="flex gap-3 items-end justify-start">
                                    <div className="w-8 h-8 rounded-full bg-brand-400/20 flex items-center justify-center flex-shrink-0 border border-brand-400/30">
                                        <Bot className="w-5 h-5 text-brand-400"/>
                                    </div>
                                    <div className="p-3 bg-dark-800 rounded-lg flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse delay-0"></span>
                                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse delay-150"></span>
                                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse delay-300"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="flex-shrink-0 p-4 border-t border-dark-700 bg-dark-900">
                            <form onSubmit={handleSend} className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask about anime..."
                                    disabled={isLoading}
                                    className="w-full bg-dark-800 border border-dark-600 rounded-full py-3 pl-5 pr-12 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !inputValue.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-brand-400 text-black rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <CornerDownLeft className="w-5 h-5" />}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};