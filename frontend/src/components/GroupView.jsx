import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
// WICHTIG: ChatRoom wird jetzt von extern importiert und NICHT mehr hier definiert
import ChatRoom from './ChatRoom';
import { ArrowLeft, Users, MessageCircle, Plus, CheckCircle } from 'lucide-react';

// --- HAUPT VIEW (Liste & Erstellen) ---
// Die Komponente ist jetzt viel kürzer, da der Chat ausgelagert wurde.
const GroupView = ({ place, user, onBack }) => {
    const [groups, setGroups] = useState([]);
    const [view, setView] = useState("list"); // "list", "create", "chat"
    const [activeGroup, setActiveGroup] = useState(null);
    const [loading, setLoading] = useState(false);

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
            console.error("Error loading groups:", err);
            setGroups([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if(!newGroup.title) return alert("Title required!");
        try {
            await ApiService.createGroup(place.properties.id, newGroup, user);
            setView("list");
            await loadGroups();
        } catch (err) {
            console.error("Creation failed:", err);
            alert("Error: " + err.message);
        }
    };

    const handleJoin = async (group) => {
        try {
            await ApiService.joinGroup(place.properties.id, group.group_id, user);
            setActiveGroup(group);
            setView("chat");
        } catch (err) {
            alert("Join failed: " + err.message);
        }
    };

    const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#0f172a', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

    // 1. CHAT VIEW
    if (view === "chat" && activeGroup) {
        // Hier wird die importierte ChatRoom Komponente verwendet
        return (
            <ChatRoom
                locationId={place.properties.id}
                groupId={activeGroup.group_id}
                title={activeGroup.title}
                user={user}
                onBack={() => { setView("list"); loadGroups(); }}
            />
        );
    }

    // 2. CREATE VIEW
    if (view === "create") {
        return (
            <div style={{padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', color: '#1e293b'}}>
                <button onClick={() => setView("list")} style={{background:'none', border:'none', marginBottom: '15px', cursor:'pointer', display:'flex', alignItems:'center', color: '#64748b', fontSize: '14px', padding: 0}}>
                    <ArrowLeft size={16} style={{marginRight: '5px'}}/> Back
                </button>
                <h3 style={{marginTop: 0, color: '#0f172a'}}>Create New Group</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    <div><label style={{display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600'}}>Title</label><input placeholder="e.g., Museum Tour" value={newGroup.title} onChange={e => setNewGroup({...newGroup, title: e.target.value})} style={inputStyle}/></div>
                    <div><label style={{display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600'}}>Description</label><textarea rows={3} placeholder="What are you planning?" value={newGroup.description} onChange={e => setNewGroup({...newGroup, description: e.target.value})} style={{...inputStyle, resize: 'none'}}/></div>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <div style={{flex: 1}}><label style={{display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600'}}>Min Age</label><input type="number" value={newGroup.minAge} onChange={e => setNewGroup({...newGroup, minAge: e.target.value})} style={inputStyle}/></div>
                        <div style={{flex: 1}}><label style={{display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600'}}>Max Age</label><input type="number" value={newGroup.maxAge} onChange={e => setNewGroup({...newGroup, maxAge: e.target.value})} style={inputStyle}/></div>
                    </div>
                    <div><label style={{display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600'}}>Date</label><input type="date" value={newGroup.date} onChange={e => setNewGroup({...newGroup, date: e.target.value})} style={inputStyle}/></div>
                    <button className="btn-primary" onClick={handleCreate} style={{marginTop: '10px'}}>Create</button>
                </div>
            </div>
        );
    }

    // 3. LIST VIEW (Standard)
    return (
        <div style={{height: '100%', display: 'flex', flexDirection: 'column', color: '#1e293b'}}>
            <div style={{padding: '20px', borderBottom: '1px solid #e2e8f0', background: 'white'}}>
                <button onClick={onBack} style={{background:'none', border:'none', marginBottom: '10px', cursor:'pointer', display:'flex', alignItems:'center', color: '#64748b', padding: 0}}>
                    <ArrowLeft size={16} style={{marginRight: '5px'}}/> Back to Map
                </button>
                <h2 style={{margin: '0 0 5px 0', fontSize: '20px', color: '#0f172a'}}>{place.properties.name}</h2>
                <p style={{margin: 0, fontSize: '13px', color: '#64748b'}}>{place.properties.address}</p>
            </div>

            <div style={{flex: 1, overflowY: 'auto', padding: '15px', background: '#f8fafc'}}>

                <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '15px'}}>
                    <button onClick={() => setView("create")} style={{background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', borderRadius: '20px', padding: '6px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems:'center', gap: '4px'}}>
                        <Plus size={16}/> New Group
                    </button>
                </div>

                {loading && <div style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>Loading Groups...</div>}

                {groups.length === 0 && !loading && (
                    <div style={{textAlign: 'center', padding: '30px', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '12px'}}>
                        <Users size={32} style={{opacity: 0.3, marginBottom: '10px'}}/>
                        <p style={{margin: 0}}>No groups here.</p>
                        <button onClick={() => setView("create")} style={{marginTop: '10px', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline'}}>Create the first one!</button>
                    </div>
                )}

                {groups.map(group => {
                    // Robuste Prüfung: Sicherstellen, dass members existiert und ein Array ist
                    const isMember = group.members && Array.isArray(group.members) && group.members.some(m => m.user_id === user.user_id);
                    return (
                        <div key={group.group_id} style={{border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', marginBottom: '12px', background: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px'}}>
                                <div>
                                    <h4 style={{margin: 0, color: '#0f172a', fontSize: '16px'}}>{group.title}</h4>
                                    {isMember && <span style={{fontSize: '10px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px'}}><CheckCircle size={10}/> Joined</span>}
                                </div>
                                <span style={{fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontWeight: '500'}}>
                                    {group.age_range[0]}-{group.age_range[1]} Yrs
                                </span>
                            </div>
                            <p style={{fontSize: '13px', color: '#64748b', margin: '0 0 15px 0', lineHeight: '1.4'}}>{group.description}</p>

                            {isMember ? (
                                <button onClick={() => {setActiveGroup(group); setView("chat");}} style={{width: '100%', padding: '10px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '600', fontSize: '13px'}}>
                                    <MessageCircle size={16}/> Open Chat
                                </button>
                            ) : (
                                <button onClick={() => handleJoin(group)} style={{width: '100%', padding: '10px', background: 'white', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s'}}>
                                    Join
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