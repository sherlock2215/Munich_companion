// src/components/ChatRoom.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ApiService } from '../services/api';
import { ArrowLeft, Send } from 'lucide-react';

const ChatRoom = ({ locationId, groupId, title, user, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const ws = useRef(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        // Historie laden
        ApiService.getChatHistory(locationId, groupId, user.user_id)
            .then(hist => setMessages(hist || []))
            .catch(console.error);

        // WebSocket verbinden
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/ws/${groupId}`;

        ws.current = new WebSocket(wsUrl);
        ws.current.onopen = () => console.log("WS Verbunden");
        ws.current.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            setMessages(prev => [...prev, msg]);
        };

        return () => ws.current?.close();
    }, [groupId]);

    useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

    const sendMessage = async () => {
        if(!input.trim()) return;
        try {
            await ApiService.sendChatMessage(locationId, groupId, user, input);
            setInput("");
        } catch (e) {
            console.error("Senden fehlgeschlagen", e);
        }
    };

    return (
        <div style={{height: '100%', display: 'flex', flexDirection: 'column', background: 'white'}}>
            {/* Header */}
            <div style={{padding: '15px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', background: 'white'}}>
                <button onClick={onBack} style={{background:'none', border:'none', cursor:'pointer', color: '#64748b', padding: 0}}><ArrowLeft size={20}/></button>
                <div>
                    <h3 style={{margin:0, fontSize: '16px', color: '#0f172a'}}>{title}</h3>
                    <small style={{color: '#64748b'}}>Live Chat</small>
                </div>
            </div>

            {/* Nachrichten */}
            <div style={{flex: 1, overflowY: 'auto', padding: '15px', background: '#f8fafc'}}>
                {messages.map((m, i) => (
                    <div key={i} style={{marginBottom: '10px', textAlign: m.sender_id === user.user_id ? 'right' : 'left'}}>
                        <div style={{
                            display: 'inline-block', padding: '8px 14px', borderRadius: '16px',
                            background: m.sender_id === user.user_id ? '#2563eb' : 'white',
                            color: m.sender_id === user.user_id ? 'white' : '#334155',
                            border: m.sender_id !== user.user_id ? '1px solid #e2e8f0' : 'none',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)', maxWidth: '85%', textAlign: 'left'
                        }}>
                            <small style={{opacity: 0.8, fontSize: '10px', display: 'block', marginBottom: '2px', color: m.sender_id === user.user_id ? '#bfdbfe' : '#94a3b8'}}>
                                {m.sender_name}
                            </small>
                            <span style={{fontSize: '14px'}}>{m.content}</span>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{padding: '15px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px'}}>
                <input
                    value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Nachricht schreiben..."
                    style={{flex: 1, padding: '12px', borderRadius: '24px', border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#0f172a', outline: 'none'}}
                />
                <button onClick={sendMessage} style={{background: '#2563eb', color: 'white', border: 'none', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}>
                    <Send size={18}/>
                </button>
            </div>
        </div>
    );
};

export default ChatRoom;