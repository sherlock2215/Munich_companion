import React, { useState, useEffect } from 'react';
import { Mountain, Mail, Github, UserCircle2, ArrowRight, LogOut, MapPin, MessageCircle, Check } from 'lucide-react';

// --- COMPONENTS ---

const LoginScreen = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            newErrors.password = 'Password must contain uppercase, lowercase letters and numbers';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const saveUserData = (data) => {
        const stored = localStorage.getItem('munichConnectUser');
        const existing = stored ? JSON.parse(stored) : {};
        const updated = { ...existing, ...data };
        localStorage.setItem('munichConnectUser', JSON.stringify(updated));
    };

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            saveUserData({ isLoggedIn: true, email: email });
            if (onLoginSuccess) onLoginSuccess();
            else window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 animate-fade-in">
                <div className="text-center mb-8">
                    <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                        <Mountain className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800">Munich Connect</h1>
                    <p className="text-slate-500 mt-2">Find people near you. Servus!</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                                errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'
                            }`}
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors({...errors, email: ''});
                            }}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                                errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200'
                            }`}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) setErrors({...errors, password: ''});
                            }}
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        <p className="text-xs text-slate-500 mt-1">
                            Must be at least 8 characters with uppercase, lowercase letters and numbers
                        </p>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-md shadow-blue-200"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export const SetupScreen = ({ onSetupComplete }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: 25,
        gender: 'select'
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('munichConnectUser');
        if (stored) {
            const parsed = JSON.parse(stored);
            setFormData(prev => ({
                ...prev,
                name: parsed.name || '',
                age: parsed.age || 25,
                gender: parsed.gender || 'select'
            }));
        }
    }, []);

    const handleFinishSetup = (e) => {
        e.preventDefault();
        if (!formData.name || formData.gender === 'select') {
            setError('Please fill out all fields so others can find you!');
            return;
        }

        const stored = localStorage.getItem('munichConnectUser');
        const existing = stored ? JSON.parse(stored) : {};
        const updated = {
            ...existing,
            name: formData.name,
            age: formData.age,
            gender: formData.gender
        };
        localStorage.setItem('munichConnectUser', JSON.stringify(updated));

        if (onSetupComplete) onSetupComplete();
        else window.location.reload();
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserCircle2 className="text-green-600 w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Complete Your Profile</h2>
                    <p className="text-slate-500 mt-2">Tell Munich a bit about yourself.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleFinishSetup} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Maximilian"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Age: <span className="text-blue-600 font-bold">{formData.age}</span>
                        </label>
                        <div className="relative pt-2">
                            <input
                                type="range"
                                min="18"
                                max="99"
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                                value={formData.age}
                                onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                                style={{
                                    background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((formData.age - 18) / (99 - 18)) * 100}%, #e2e8f0 ${((formData.age - 18) / (99 - 18)) * 100}%, #e2e8f0 100%)`
                                }}
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>18</span>
                                <span>99</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                        <select
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={formData.gender}
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        >
                            <option value="select" disabled>Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="diverse">Diverse</option>
                            <option value="notsay">Prefer not to say</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
                    >
                        Let's Go <ArrowRight className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export const InterestsScreen = ({ onInterestsComplete }) => {
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState(new Set());

    const interestCategories = [
        {
            category: "Gaming & Tech",
            icon: "🎮",
            interests: [
                "Puzzle Games", "Game Modeling & Customization", "Card Games", "Competitive Gaming",
                "Speedrunning", "Programming", "Web Development", "App Development", "Robotics", "AI",
                "VR & AR", "Video Game Development", "Blockchain & Crypto", "Gadgets & Electronics",
                "Space Exploration", "Home Automation", "3D Printing", "Cybersecurity", "Ethical Hacking",
                "Data Science", "Video Games", "Mobile Games", "eSports", "Board Games", "Fantasy Sports",
                "VR Gaming", "Game Streaming", "Tabletop RPGs", "Strategy Games", "Retro Gaming"
            ]
        },
        {
            category: "Food & Drink",
            icon: "🍽️",
            interests: [
                "Cooking & Baking", "Mixology", "Vegan Cooking", "Food Blogging", "Coffee Culture",
                "Street Food", "International Cuisine", "Wine Tasting", "Cheese Tasting", "Fermentation",
                "Craft Beer", "Tea Culture", "Desserts & Pastry", "BBQ & Grilling", "Food Photography"
            ]
        },
        {
            category: "Sports & Fitness",
            icon: "⚽",
            interests: [
                "Running", "Skating", "CrossFit", "Yoga", "Hiking", "Pilates", "Surfing", "Skiing",
                "Weightlifting", "Soccer", "Swimming", "Basketball", "Cycling", "Tennis", "Rock Climbing",
                "Martial Arts"
            ]
        },
        {
            category: "Outdoor & Adventure",
            icon: "🌲",
            interests: [
                "Camping", "Wildlife Photography", "Kayaking", "Fishing", "Sailing", "Mountaineering",
                "Geocaching", "Scuba Diving", "Horseback Riding", "Bird Watching", "Hunting", "Stargazing",
                "Foraging"
            ]
        },
        {
            category: "Travel & Exploration",
            icon: "✈️",
            interests: [
                "Adventure Travel", "Backpacking", "Road Trips", "Cultural Immersion", "City Tours",
                "Off-the-Beaten-Path", "Volunteering Abroad", "Ecotourism", "Travel Hacking",
                "Historical Sites", "Travel Writing", "Language Learning", "Travel Photography", "Cruises",
                "Luxury Travel", "Learn Local Language", "Live Music", "Local Markets", "Local Cocktails",
                "Coworking Spaces", "Hiking Trails", "Walking Tours", "Photography", "Day Trips",
                "Exploring on Foot", "Museums", "Local Wildlife", "Churches", "New Activities"
            ]
        },
        {
            category: "Arts & Culture",
            icon: "🎨",
            interests: [
                "Photography", "Graphic Design", "Street Art", "Crafting", "Dance", "Painting",
                "Drawing", "Sculpture", "Architecture", "Calligraphy", "Art History", "Theater",
                "Film", "Opera", "Poetry", "Creative Writing"
            ]
        },
        {
            category: "Literature & Reading",
            icon: "📚",
            interests: [
                "Comics & Graphic Novels", "Manga & Anime", "Fiction", "Non-Fiction", "Audiobooks"
            ]
        },
        {
            category: "Music",
            icon: "🎵",
            interests: [
                "Playing Instruments", "Hip-Hop", "Rock & Metal", "Electronic Music", "Music Festivals",
                "D.J.ing", "Vinyl Collecting", "Songwriting", "Music Production", "Classical Music",
                "Jazz", "World Music", "Music History", "Musical Theater", "Singing"
            ]
        },
        {
            category: "Social Causes & Activism",
            icon: "🌍",
            interests: [
                "Mental Health Advocacy", "Education Reform", "Environmental Activism", "Human Rights",
                "LGBTQ+ Advocacy", "Gender Equality", "Animal Rights", "Climate Change", "Volunteering",
                "Racial Equality", "Political Activism", "Philanthropy", "Fair Trade"
            ]
        }
    ];

    const toggleInterest = (interest) => {
        setSelectedInterests(prev => {
            const newSelection = prev.includes(interest)
                ? prev.filter(item => item !== interest)
                : [...prev, interest];

            // Update categories based on selected interests
            const newCategories = new Set();
            interestCategories.forEach(cat => {
                if (cat.interests.some(inter => newSelection.includes(inter))) {
                    newCategories.add(cat.category);
                }
            });
            setSelectedCategories(newCategories);

            return newSelection;
        });
    };

    const toggleCategory = (category) => {
        const categoryData = interestCategories.find(cat => cat.category === category);
        if (!categoryData) return;

        const categoryInterests = categoryData.interests;
        const allCategoryInterestsSelected = categoryInterests.every(interest =>
            selectedInterests.includes(interest)
        );

        setSelectedInterests(prev => {
            let newSelection;
            if (allCategoryInterestsSelected) {
                // Remove all interests from this category
                newSelection = prev.filter(interest => !categoryInterests.includes(interest));
            } else {
                // Add all interests from this category
                newSelection = [...new Set([...prev, ...categoryInterests])];
            }

            // Update categories
            const newCategories = new Set();
            interestCategories.forEach(cat => {
                if (cat.interests.some(inter => newSelection.includes(inter))) {
                    newCategories.add(cat.category);
                }
            });
            setSelectedCategories(newCategories);

            return newSelection;
        });
    };

    const handleContinue = () => {
        const stored = localStorage.getItem('munichConnectUser');
        const existing = stored ? JSON.parse(stored) : {};
        const updated = {
            ...existing,
            interests: selectedInterests,
            interestCategories: Array.from(selectedCategories),
            setupComplete: true
        };
        localStorage.setItem('munichConnectUser', JSON.stringify(updated));

        if (onInterestsComplete) onInterestsComplete();
        else window.location.reload();
    };

    const getCategorySelectionCount = (category) => {
        const categoryData = interestCategories.find(cat => cat.category === category);
        return categoryData ? categoryData.interests.filter(interest => selectedInterests.includes(interest)).length : 0;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white w-full max-w-6xl rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="text-purple-600 w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Select Your Interests</h2>
                    <p className="text-slate-500 mt-2">
                        Choose what you're interested in to find like-minded people
                        {selectedInterests.length > 0 && (
                            <span className="text-blue-600 font-medium ml-2">
                                ({selectedInterests.length} selected)
                            </span>
                        )}
                    </p>
                </div>

                {/* Category Navigation */}
                <div className="flex flex-wrap gap-2 mb-6 justify-center">
                    {interestCategories.map((category) => (
                        <button
                            key={category.category}
                            onClick={() => toggleCategory(category.category)}
                            className={`px-4 py-2 rounded-full border-2 transition-all font-medium text-sm ${
                                selectedCategories.has(category.category)
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                            }`}
                        >
                            {category.icon} {category.category}
                            {getCategorySelectionCount(category.category) > 0 && (
                                <span className="ml-1 bg-white text-blue-600 rounded-full px-1.5 py-0.5 text-xs">
                                    {getCategorySelectionCount(category.category)}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Interests Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 max-h-96 overflow-y-auto p-4">
                    {interestCategories.map((category) => (
                        <div key={category.category} className="bg-slate-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg">{category.icon}</span>
                                <h3 className="font-semibold text-slate-800">{category.category}</h3>
                                <span className="text-xs bg-slate-200 text-slate-600 rounded-full px-2 py-1">
                                    {getCategorySelectionCount(category.category)}/{category.interests.length}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {category.interests.map((interest) => (
                                    <button
                                        key={interest}
                                        type="button"
                                        onClick={() => toggleInterest(interest)}
                                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                                            selectedInterests.includes(interest)
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm transform scale-105'
                                                : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                                        }`}
                                    >
                                        {interest}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center border-t pt-6">
                    <p className="text-slate-600 text-sm">
                        Select at least 1 interest to continue
                    </p>
                    <button
                        onClick={handleContinue}
                        disabled={selectedInterests.length === 0}
                        className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                            selectedInterests.length > 0
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200'
                                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        Complete Profile <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;