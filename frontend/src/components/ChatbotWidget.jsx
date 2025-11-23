import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { ApiService } from '../services/api'; // Pfad korrekt: ../services/api

const ChatbotWidget = ({ userLocation }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ sender: 'bot', text: "Servus! I'm your Munich Companion. Ask me anything about the city!" }]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput("");
        setLoading(true);

        try {
            const lat = userLocation?.lat || 48.137;
            const lng = userLocation?.lon || 11.575;
            // Ruft den /api/chatbot/user Endpoint auf
            const response = await ApiService.askChatbot(userMsg, lat, lng);
            setMessages(prev => [...prev, { sender: 'bot', text: response.response }]);
        } catch (err) {
            setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I couldn't reach the server." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '40px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    width: '350px', height: '500px', background: 'white', borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', marginBottom: '15px', overflow: 'hidden', border: '1px solid #e2e8f0'
                }}>
                    {/* Header */}
                    <div style={{ background: '#0f172a', padding: '15px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <Bot size={20} /> <span style={{fontWeight: '600'}}>Munich Bot</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer'}}><X size={18} /></button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '15px', background: '#f8fafc' }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{ marginBottom: '10px', textAlign: m.sender === 'user' ? 'right' : 'left' }}>
                                <div style={{
                                    display: 'inline-block', padding: '10px 14px', borderRadius: '12px', maxWidth: '85%', fontSize: '14px', lineHeight: '1.4',
                                    background: m.sender === 'user' ? '#2563eb' : 'white',
                                    color: m.sender === 'user' ? 'white' : '#334155',
                                    border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {loading && <div style={{ textAlign: 'left', color: '#94a3b8', fontSize: '12px', marginLeft: '10px' }}>Writing...</div>}
                        <div ref={scrollRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: '15px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
                        <input
                            value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Ask for tips..." autoFocus
                            style={{
                                flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #cbd5e1', outline: 'none',
                                background: 'white',
                                color: '#0f172a'
                            }}
                        />
                        <button onClick={handleSend} disabled={loading} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '50%', width: '38px', height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px', height: '60px', borderRadius: '30px', background: '#2563eb', color: 'white',
                    border: 'none', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
            </button>
        </div>
    );
};

export default ChatbotWidget;