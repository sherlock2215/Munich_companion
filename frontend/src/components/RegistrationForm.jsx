// frontend/src/components/RegistrationForm.jsx

import React, { useState } from 'react';
import { ApiService } from '../services/api';
import { User, Lock, Calendar, Globe } from 'lucide-react';

const RegistrationForm = ({ onRegisterSuccess }) => {
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("male");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const ageInt = parseInt(age);
        if (!name.trim() || isNaN(ageInt) || ageInt < 18 || ageInt > 100) {
            setError("Please enter a valid name and an age between 18 and 100.");
            return;
        }

        setLoading(true);
        // Wir verwenden eine einfache zeitbasierte ID für die Demo
        const newUserId = Math.floor(Date.now() / 1000);

        const newUser = {
            user_id: newUserId,
            name: name.trim(),
            age: ageInt,
            gender: gender,
            interests: ["culture", "food", "party"],
            bio: "Exploring Munich!"
        };

        try {
            const res = await ApiService.registerUser(newUser);
            // Speichern des Benutzers in LocalStorage für persistente Sitzung
            localStorage.setItem('currentUser', JSON.stringify(res.user));
            onRegisterSuccess(res.user);
        } catch (e) {
            setError(e.message || "Registration failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = { width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
            <div style={{
                width: '400px', padding: '30px', background: 'white', borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)', color: '#1e293b'
            }}>
                <Globe size={40} color="#2563eb" style={{marginBottom: '10px'}}/>
                <h1 style={{margin: '0 0 5px 0', fontSize: '24px', color: '#0f172a'}}>Welcome to Munich Companion!</h1>
                <p style={{marginBottom: '20px', fontSize: '14px', color: '#64748b'}}>Please register to find local groups.</p>

                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    {/* Name */}
                    <div style={{position: 'relative'}}>
                        <User size={18} color="#94a3b8" style={{position: 'absolute', left: '12px', top: '12px'}}/>
                        <input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} required />
                    </div>

                    {/* Age */}
                    <div style={{position: 'relative'}}>
                        <Calendar size={18} color="#94a3b8" style={{position: 'absolute', left: '12px', top: '12px'}}/>
                        <input type="number" placeholder="Age (min 18)" value={age} onChange={e => setAge(e.target.value)} style={inputStyle} min="18" max="100" required />
                    </div>

                    {/* Gender */}
                    <div style={{position: 'relative'}}>
                        <Lock size={18} color="#94a3b8" style={{position: 'absolute', left: '12px', top: '12px'}}/>
                        <select value={gender} onChange={e => setGender(e.target.value)} style={inputStyle}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="divers">Diverse</option>
                        </select>
                    </div>

                    {error && <p style={{color: '#ef4444', fontSize: '13px', margin: 0}}>{error}</p>}

                    <button type="submit" className="btn-primary" disabled={loading} style={{marginTop: '10px', width: '100%', background: loading ? '#94a3b8' : '#2563eb'}}>
                        {loading ? 'Registering...' : 'Start Exploring'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegistrationForm;