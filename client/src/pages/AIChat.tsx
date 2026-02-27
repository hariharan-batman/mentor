import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { useAppContext } from '../context/AppContext';
import { MessageSquare, Send, Bot, User } from 'lucide-react';

interface Message {
    role: string;
    content: string;
    timestamp?: string;
}

export const AIChat: React.FC = () => {
    const { companyData } = useAppContext();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        api.getChatHistory()
            .then(res => {
                if (res && res.messages) {
                    setMessages(res.messages);
                }
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = { role: 'user', content: input, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.chatWithAI(input);
            if (res && res.success && res.response) {
                const aiMsg: Message = { 
                    role: 'assistant', 
                    content: res.response,
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                const errorMsg: Message = { 
                    role: 'assistant', 
                    content: 'Sorry, I encountered an error. Please try again.',
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, errorMsg]);
            }
        } catch (err) {
            console.error(err);
            const errorMsg: Message = { 
                role: 'assistant', 
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col space-y-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="text-indigo-600" /> AI Chat Mentor
                </h1>
                <p className="text-slate-500 mt-1">
                    Ask questions and get personalized startup advice based on {companyData.name ? `${companyData.name}'s profile` : 'your company profile'}.
                </p>
            </div>

            {!companyData.name && (
                <Card className="bg-yellow-50 border-yellow-200">
                    <div className="flex items-start gap-3">
                        <div className="text-yellow-600 mt-1">⚠️</div>
                        <div>
                            <h3 className="font-semibold text-yellow-900">Complete Your Company Profile</h3>
                            <p className="text-sm text-yellow-800 mt-1">
                                For better AI responses, complete your company details first. The AI will use this context to provide personalized advice.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            <Card className="flex-1 flex flex-col h-full overflow-hidden p-0 relative">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.length === 0 ? (
                        <div className="text-center text-slate-500 py-10">
                            <MessageSquare className="mx-auto w-12 h-12 text-slate-300 mb-4" />
                            <p className="font-semibold text-slate-700 mb-2">Start a conversation with your AI Mentor!</p>
                            <p className="text-sm">Ask about funding, compliance, strategy, or anything related to your startup.</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                                </div>
                                <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                            </div>
                        ))
                    )}
                    {loading && (
                        <div className="flex gap-4 flex-row">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-100 text-slate-700">
                                <Bot size={18} />
                            </div>
                            <div className="px-4 py-3 rounded-2xl max-w-[80%] bg-slate-100 text-slate-800 rounded-tl-none flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></div>
                                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-slate-100 p-4 bg-white shrink-0">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask me anything about your startup..."
                            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            disabled={loading}
                        />
                        <button type="submit" disabled={loading || !input.trim()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center">
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </Card>
        </div>
    );
};
