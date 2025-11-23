import React, { useState, useEffect, useRef } from 'react';
import { ApiService } from '../services/api';
import { ArrowLeft, Users, MessageCircle, Plus, Send, CheckCircle } from 'lucide-react';

// --- CHAT KOMPONENTE (Unverändert, nur Styles angepasst) ---
const ChatRoom = ({ locationId, group, user, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const ws = useRef(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        // Historie laden
        ApiService.getChatHistory(locationId, group.group_id, user.user_id)
            .then(hist => setMessages(hist || []))
            .catch(console.error);

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/ws/${group.group_id}`;

        ws.current = new WebSocket(wsUrl);
        ws.current.onopen = () => console.log("WS Verbunden");
        ws.current.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            setMessages(prev => [...prev, msg]);
        };

        return () => ws.current?.close();
    }, [group.group_id]);

    useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

    const sendMessage = async () => {
        if(!input.trim()) return;
        try {
            await ApiService.sendChatMessage(locationId, group.group_id, user, input);
            setInput("");
        } catch (e) {
            console.error("Senden fehlgeschlagen", e);
        }
    };

    return (
        <div style={{height: '100%', display: 'flex', flexDirection: 'column', color: '#1e293b'}}>
            <div style={{padding: '15px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', background: 'white'}}>
                <button onClick={onBack} style={{background:'none', border:'none', cursor:'pointer', color: '#64748b', padding: 0}}><ArrowLeft size={20}/></button>
                <div>
                    <h3 style={{margin:0, fontSize: '16px', color: '#0f172a'}}>{group.title}</h3>
                    <small style={{color: '#64748b'}}>Chat</small>
                </div>
            </div>
            <div style={{flex: 1, overflowY: 'auto', padding: '15px', background: '#f8fafc'}}>
                {messages.map((m, i) => (
                    <div key={i} style={{marginBottom: '10px', textAlign: m.sender_id === user.user_id ? 'right' : 'left'}}>
                        <div style={{display: 'inline-block', padding: '8px 14px', borderRadius: '16px', background: m.sender_id === user.user_id ? '#2563eb' : 'white', color: m.sender_id === user.user_id ? 'white' : '#334155', border: m.sender_id !== user.user_id ? '1px solid #e2e8f0' : 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', maxWidth: '85%', textAlign: 'left'}}>
                            <small style={{opacity: 0.8, fontSize: '10px', display: 'block', marginBottom: '2px', color: m.sender_id === user.user_id ? '#bfdbfe' : '#94a3b8'}}>{m.sender_name}</small>
                            <span style={{fontSize: '14px'}}>{m.content}</span>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
            <div style={{padding: '15px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px'}}>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Nachricht schreiben..." style={{flex: 1, padding: '12px', borderRadius: '24px', border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#0f172a', outline: 'none'}} />
                <button onClick={sendMessage} style={{background: '#2563eb', color: 'white', border: 'none', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0}}><Send size={18}/></button>
            </div>
        </div>
    );
};

// --- HAUPT VIEW (Liste, Tabs & Erstellen) ---
const GroupView = ({ place, user, onBack }) => {
    const [groups, setGroups] = useState([]);
    const [view, setView] = useState("list"); // "list", "create", "chat"
    const [activeGroup, setActiveGroup] = useState(null);
    const [loading, setLoading] = useState(false);

    // TAB STATE: 'all' oder 'my'
    const [activeTab, setActiveTab] = useState("all");

    // Form State
    const [newGroup, setNewGroup] = useState({ title: "", description: "", minAge: 18, maxAge: 99, date: new Date().toISOString().split('T')[0] });

    useEffect(() => {
        if(view === 'list') loadGroups();
    }, [place.properties.id, view]);

    const loadGroups = async () => {
        setLoading(true);
        try {
            const data = await ApiService.getGroupsAtLocation(place.properties.id);
            setGroups(data || []);
        } catch (err) {
            console.error("Fehler beim Laden der Gruppen:", err);
            setGroups([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if(!newGroup.title) return alert("Titel fehlt!");

        try {
            // 1. Gruppe erstellen
            await ApiService.createGroup(place.properties.id, newGroup, user);

            // 2. View zurücksetzen und Liste neu laden
            setView("list");
            await loadGroups();

            // 3. WICHTIG: Tab auf "Meine Gruppen" wechseln, damit man es sofort sieht
            setActiveTab("my");

        } catch (err) {
            console.error("Erstellen fehlgeschlagen:", err);
            alert("Fehler: " + err.message);
        }
    };

    const handleJoin = async (group) => {
        try {
            await ApiService.joinGroup(place.properties.id, group.group_id, user);
            // Nach Join direkt in den Chat
            setActiveGroup(group);
            setView("chat");
        } catch (err) {
            alert("Beitritt fehlgeschlagen: " + err.message);
        }
    };

    // --- Filter Logik ---
    const displayedGroups = groups.filter(g => {
        if (activeTab === 'all') return true;
        if (activeTab === 'my') {
            // Prüfen ob User ID in der Member Liste ist
            return g.members && g.members.some(m => m.user_id === user.user_id);
        }
        return true;
    });

    const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#0f172a', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

    // 1. CHAT VIEW
    if (view === "chat" && activeGroup) {
        return <ChatRoom locationId={place.properties.id} group={activeGroup} user={user} onBack={() => { setView("list"); loadGroups(); }} />;
    }

    // 2. CREATE VIEW
    if (view === "create") {
        return (
            <div style={{padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', color: '#1e293b'}}>
                <button onClick={() => setView("list")} style={{background:'none', border:'none', marginBottom: '15px', cursor:'pointer', display:'flex', alignItems:'center', color: '#64748b', fontSize: '14px', padding: 0}}>
                    <ArrowLeft size={16} style={{marginRight: '5px'}}/> Zurück
                </button>
                <h3 style={{marginTop: 0, color: '#0f172a'}}>Neue Gruppe erstellen</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    <div><label style={{display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600'}}>Titel</label><input placeholder="z.B. Museumstour" value={newGroup.title} onChange={e => setNewGroup({...newGroup, title: e.target.value})} style={inputStyle}/></div>
                    <div><label style={{display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600'}}>Beschreibung</label><textarea rows={3} placeholder="Was habt ihr vor?" value={newGroup.description} onChange={e => setNewGroup({...newGroup, description: e.target.value})} style={{...inputStyle, resize: 'none'}}/></div>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <div style={{flex: 1}}><label style={{display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600'}}>Min Alter</label><input type="number" value={newGroup.minAge} onChange={e => setNewGroup({...newGroup, minAge: e.target.value})} style={inputStyle}/></div>
                        <div style={{flex: 1}}><label style={{display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600'}}>Max Alter</label><input type="number" value={newGroup.maxAge} onChange={e => setNewGroup({...newGroup, maxAge: e.target.value})} style={inputStyle}/></div>
                    </div>
                    <div><label style={{display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600'}}>Datum</label><input type="date" value={newGroup.date} onChange={e => setNewGroup({...newGroup, date: e.target.value})} style={inputStyle}/></div>
                    <button className="btn-primary" onClick={handleCreate} style={{marginTop: '10px'}}>Erstellen & Beitreten</button>
                </div>
            </div>
        );
    }

    // 3. LIST VIEW (Mit Tabs)
    return (
        <div style={{height: '100%', display: 'flex', flexDirection: 'column', color: '#1e293b'}}>
            {/* Header */}
            <div style={{padding: '20px', borderBottom: '1px solid #e2e8f0', background: 'white'}}>
                <button onClick={onBack} style={{background:'none', border:'none', marginBottom: '10px', cursor:'pointer', display:'flex', alignItems:'center', color: '#64748b', padding: 0}}>
                    <ArrowLeft size={16} style={{marginRight: '5px'}}/> Zurück zur Karte
                </button>
                <h2 style={{margin: '0 0 5px 0', fontSize: '20px', color: '#0f172a'}}>{place.properties.name}</h2>
                <p style={{margin: 0, fontSize: '13px', color: '#64748b'}}>{place.properties.address}</p>
            </div>

            {/* TAB LEISTE */}
            <div style={{display: 'flex', borderBottom: '1px solid #e2e8f0', background: 'white'}}>
                <button
                    onClick={() => setActiveTab('all')}
                    style={{
                        flex: 1, padding: '12px', border: 'none', background: 'none', cursor: 'pointer',
                        fontWeight: '600', fontSize: '14px',
                        color: activeTab === 'all' ? '#2563eb' : '#64748b',
                        borderBottom: activeTab === 'all' ? '2px solid #2563eb' : '2px solid transparent'
                    }}
                >
                    Alle Gruppen
                </button>
                <button
                    onClick={() => setActiveTab('my')}
                    style={{
                        flex: 1, padding: '12px', border: 'none', background: 'none', cursor: 'pointer',
                        fontWeight: '600', fontSize: '14px',
                        color: activeTab === 'my' ? '#2563eb' : '#64748b',
                        borderBottom: activeTab === 'my' ? '2px solid #2563eb' : '2px solid transparent'
                    }}
                >
                    Meine Gruppen
                </button>
            </div>

            {/* Listen Inhalt */}
            <div style={{flex: 1, overflowY: 'auto', padding: '15px', background: '#f8fafc'}}>

                {/* Nur im "Alle" Tab den "Neu" Button zeigen */}
                {activeTab === 'all' && (
                    <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '15px'}}>
                        <button onClick={() => setView("create")} style={{background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', borderRadius: '20px', padding: '6px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems:'center', gap: '4px'}}>
                            <Plus size={16}/> Neue Gruppe
                        </button>
                    </div>
                )}

                {loading && <div style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>Lade Gruppen...</div>}

                {!loading && displayedGroups.length === 0 && (
                    <div style={{textAlign: 'center', padding: '30px', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '12px'}}>
                        <Users size={32} style={{opacity: 0.3, marginBottom: '10px'}}/>
                        <p style={{margin: 0}}>
                            {activeTab === 'my' ? "Du bist noch in keiner Gruppe hier." : "Keine Gruppen gefunden."}
                        </p>
                        {activeTab === 'all' && (
                            <button onClick={() => setView("create")} style={{marginTop: '10px', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline'}}>Erstelle die erste!</button>
                        )}
                    </div>
                )}

                {displayedGroups.map(group => {
                    const isMember = group.members && group.members.some(m => m.user_id === user.user_id);
                    return (
                        <div key={group.group_id} style={{border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', marginBottom: '12px', background: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px'}}>
                                <div>
                                    <h4 style={{margin: 0, color: '#0f172a', fontSize: '16px'}}>{group.title}</h4>
                                    {isMember && <span style={{fontSize: '10px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px'}}><CheckCircle size={10}/> Beigetreten</span>}
                                </div>
                                <span style={{fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontWeight: '500'}}>
                                    {group.age_range[0]}-{group.age_range[1]} J.
                                </span>
                            </div>
                            <p style={{fontSize: '13px', color: '#64748b', margin: '0 0 15px 0', lineHeight: '1.4'}}>{group.description}</p>

                            {isMember ? (
                                <button onClick={() => {setActiveGroup(group); setView("chat");}} style={{width: '100%', padding: '10px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '600', fontSize: '13px'}}>
                                    <MessageCircle size={16}/> Chat öffnen
                                </button>
                            ) : (
                                <button onClick={() => handleJoin(group)} style={{width: '100%', padding: '10px', background: 'white', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s'}}>
                                    Beitreten
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GroupView;