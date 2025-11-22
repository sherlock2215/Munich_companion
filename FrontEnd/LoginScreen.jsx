import React, { useState, useEffect } from 'react';
import {
    User,
    ArrowRight,
    MapPin,
    MessageCircle,
    Heart,
    LogOut,
    Mail,
    Github,
    UserCircle2,
    CheckCircle2,
    Mountain
} from 'lucide-react';

export default function App() {
    // App States: 'login', 'setup', 'dashboard'
    const [currentView, setCurrentView] = useState('loading');
    const [userData, setUserData] = useState({
        isLoggedIn: false,
        email: '',
        name: '',
        age: '',
        gender: '',
        interests: []
    });

    // Initialer Check auf localStorage beim Laden
    useEffect(() => {
        const storedUser = localStorage.getItem('munichConnectUser');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserData(parsedUser);
            // Entscheiden, wohin geleitet wird basierend auf Vollständigkeit der Daten
            if (parsedUser.isLoggedIn && parsedUser.name) {
                setCurrentView('dashboard');
            } else if (parsedUser.isLoggedIn) {
                setCurrentView('setup');
            } else {
                setCurrentView('login');
            }
        } else {
            setCurrentView('login');
        }
    }, []);

    // Hilfsfunktion zum Speichern
    const saveUserData = (newData) => {
        const updatedUser = { ...userData, ...newData };
        setUserData(updatedUser);
        localStorage.setItem('munichConnectUser', JSON.stringify(updatedUser));
    };

    const handleLogout = () => {
        localStorage.removeItem('munichConnectUser');
        setUserData({
            isLoggedIn: false,
            email: '',
            name: '',
            age: '',
            gender: '',
            interests: []
        });
        setCurrentView('login');
    };

    // --- COMPONENTS ---

    const LoginScreen = () => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');

        const handleLoginSubmit = (e) => {
            e.preventDefault();
            if (email) {
                saveUserData({ isLoggedIn: true, email: email });
                setCurrentView('setup');
            }
        };

        const handleSocialLogin = (provider) => {
            // Simulierte Social Logins
            saveUserData({ isLoggedIn: true, email: `user@${provider}.com` });
            setCurrentView('setup');
        };

        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 animate-fade-in">
                    <div className="text-center mb-8">
                        <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                            <Mountain className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800">Munich Connect</h1>
                        <p className="text-slate-500 mt-2">Finde Leute in deiner Nähe. Servus!</p>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail Adresse</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="deine.email@beispiel.de"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Passwort</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-md shadow-blue-200"
                        >
                            Anmelden
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-slate-500">Oder weiter mit</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleSocialLogin('google')}
                            className="flex items-center justify-center py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700"
                        >
                            <Mail className="w-5 h-5 mr-2 text-red-500" /> Google
                        </button>
                        <button
                            onClick={() => handleSocialLogin('apple')}
                            className="flex items-center justify-center py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700"
                        >
                            <Github className="w-5 h-5 mr-2 text-slate-900" /> Apple
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const SetupScreen = () => {
        const [formData, setFormData] = useState({
            name: userData.name || '',
            age: userData.age || '',
            gender: userData.gender || 'select'
        });
        const [error, setError] = useState('');

        const handleFinishSetup = (e) => {
            e.preventDefault();
            if (!formData.name || !formData.age || formData.gender === 'select') {
                setError('Bitte fülle alle Felder aus, damit dich andere finden können!');
                return;
            }

            saveUserData({
                name: formData.name,
                age: formData.age,
                gender: formData.gender
            });
            setCurrentView('dashboard');
        };

        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserCircle2 className="text-green-600 w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Profil vervollständigen</h2>
                        <p className="text-slate-500 mt-2">Erzähl München ein bisschen über dich.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleFinishSetup} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Dein Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="z.B. Maximilian"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Alter</label>
                                <input
                                    type="number"
                                    min="18"
                                    max="99"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="25"
                                    value={formData.age}
                                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Geschlecht</label>
                                <select
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                >
                                    <option value="select" disabled>Wählen</option>
                                    <option value="male">Männlich</option>
                                    <option value="female">Weiblich</option>
                                    <option value="diverse">Divers</option>
                                    <option value="notsay">Keine Angabe</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
                        >
                            Los geht's <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    const Dashboard = () => {
        // Mock Daten für andere User
        const mockUsers = [
            { id: 1, name: "Lena", age: 24, location: "Schwabing", desc: "Liebt Kaffee im Englischen Garten ☕️", tags: ["Studentin", "Kunst"] },
            { id: 2, name: "Thomas", age: 29, location: "Maxvorstadt", desc: "Neu in München, suche Leute zum Bouldern!", tags: ["Sport", "Tech"] },
            { id: 3, name: "Sarah", age: 26, location: "Glockenbach", desc: "Immer auf der Suche nach dem besten Döner.", tags: ["Foodie", "Reisen"] },
        ];

        return (
            <div className="min-h-screen bg-slate-100 pb-20">
                {/* Header */}
                <div className="bg-white shadow-sm sticky top-0 z-10">
                    <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Mountain className="text-blue-600 w-6 h-6" />
                            <span className="font-bold text-lg text-slate-800">Munich Connect</span>
                        </div>
                        <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-2xl mx-auto px-4 pt-6">
                    {/* Welcome Card */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg mb-8">
                        <h2 className="text-2xl font-bold mb-2">Grias di, {userData.name}! 👋</h2>
                        <p className="opacity-90">Schön dass du da bist. Hier sind ein paar Leute, die du vielleicht kennenlernen möchtest.</p>
                        <div className="flex gap-4 mt-6 text-sm font-medium">
                            <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                📍 {userData.age} Jahre
                            </div>
                            <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm capitalize">
                                👤 {userData.gender === 'male' ? 'Männlich' : userData.gender === 'female' ? 'Weiblich' : userData.gender}
                            </div>
                        </div>
                    </div>

                    <h3 className="font-bold text-slate-700 mb-4 text-lg px-1">Vorschläge für dich</h3>

                    {/* User Feed */}
                    <div className="space-y-4">
                        {mockUsers.map(user => (
                            <div key={user.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 transition-transform hover:scale-[1.01] cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-2xl">
                                            {user.id === 1 ? '👩' : user.id === 2 ? '🧔' : '👱‍♀️'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{user.name}, {user.age}</h4>
                                            <div className="flex items-center text-slate-500 text-sm mt-1">
                                                <MapPin className="w-3 h-3 mr-1" /> {user.location}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="text-slate-300 hover:text-blue-500 transition-colors">
                                        <MessageCircle className="w-6 h-6" />
                                    </button>
                                </div>

                                <p className="text-slate-600 mt-4 text-sm leading-relaxed">
                                    "{user.desc}"
                                </p>

                                <div className="flex gap-2 mt-4">
                                    {user.tags.map(tag => (
                                        <span key={tag} className="text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md">
                      #{tag}
                    </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center text-slate-400 text-sm pb-8">
                        Das war's für den Moment!<br/>
                        Schau später wieder vorbei für mehr Matches.
                    </div>
                </div>
            </div>
        );
    };

    // --- MAIN RENDER SWITCH ---

    if (currentView === 'loading') return null;

    switch (currentView) {
        case 'login':
            return <LoginScreen />;
        case 'setup':
            return <SetupScreen />;
        case 'dashboard':
            return <Dashboard />;
        default:
            return <LoginScreen />;
    }
}