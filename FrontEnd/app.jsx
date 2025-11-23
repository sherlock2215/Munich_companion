import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    MapPin, Calendar, Clock, Search, User, LogOut,
    Navigation, Map as MapIcon, List, Star,
    ChevronRight, ChevronDown, ChevronLeft, Shield, Zap, Filter, X, Plus, Minus, Locate,
    Mountain, Mail, Github, UserCircle2, ArrowRight, MessageCircle,
    Users, Info, MapPin as MapPinIcon, CheckCircle2, MoreHorizontal
} from 'lucide-react';

import EventService from './EventService';
import LoginScreen, { SetupScreen, InterestsScreen } from "./LoginScreen.jsx";
import InteractiveMap from './Map.jsx';
import PlaceDetailPanel from "./PlaceDetailPanel.jsx";
import { apiService } from './apiService';

// GroupDetailView Component
const GroupDetailView = ({ group, onBack, onJoinGroup }) => {
    const [membersOpen, setMembersOpen] = useState(false);
    const [joinSuccess, setJoinSuccess] = useState(false);


    const handleJoinGroup = async (group) => {
        try {
            const userData = JSON.parse(localStorage.getItem('munichConnectUser'));
            const joinData = {
                location_id: group.location_id || "1", // You'll need to get this from the place
                group_id: group.group_id,
                user: {
                    user_id: userData.user_id || Date.now(), // Generate ID if not exists
                    name: userData.name,
                    age: userData.age,
                    gender: userData.gender
                }
            };

            const result = await apiService.joinGroup(joinData);
            console.log('Successfully joined group:', result);

            // Refresh groups data
            fetchPlacesFromAPI();
        } catch (error) {
            console.error('Error joining group:', error);
            alert('Failed to join group. Please try again.');
        }
    };
    const handleCreateGroup = async (groupData) => {
        try {
            const userData = JSON.parse(localStorage.getItem('munichConnectUser'));
            const createData = {
                location_id: groupData.locationId,
                title: groupData.title,
                description: groupData.description,
                age_range: groupData.ageRange,
                date: groupData.date,
                host: {
                    user_id: userData.user_id || Date.now(),
                    name: userData.name,
                    age: userData.age,
                    gender: userData.gender
                }
            };

            const result = await apiService.createGroup(createData);
            console.log('Group created successfully:', result);

            // Refresh data
            fetchPlacesFromAPI();
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Failed to create group. Please try again.');
        }
    };

    if (joinSuccess) {
        return (
            <div className="flex flex-col h-full items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="text-green-600 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Successfully Joined!</h3>
                <p className="text-slate-600 mb-6">You're now a member of {group.title}</p>
                <button
                    onClick={onBack}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    Back to Groups
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
                <button
                    onClick={onBack}
                    className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-2 transition-colors"
                >
                    <ChevronLeft size={16} className="mr-1" /> Back
                </button>
                <h3 className="text-xl font-bold text-slate-900">{group.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                    <span className="flex items-center">
                        <Clock size={14} className="mr-1 text-blue-500"/> {group.time}
                    </span>
                    <span className="flex items-center">
                        <Users size={14} className="mr-1 text-green-500"/> {group.members.length} Participants
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">About this Group</h4>
                    <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-lg border border-slate-200">
                        {group.description}
                    </p>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Schedule & Activities</h4>
                    <div className="space-y-0 relative border-l-2 border-slate-100 ml-2">
                        {group.activities?.map((activity, index) => (
                            <div key={index} className="mb-6 ml-6 relative">
                                <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-white border-2 border-blue-500"></div>
                                <div className="text-xs font-bold text-blue-600 mb-0.5">{activity.time}</div>
                                <h5 className="font-bold text-slate-800 text-sm">{activity.title}</h5>
                                <p className="text-xs text-slate-500 mt-1">{activity.description}</p>
                            </div>
                        ))}
                        {(!group.activities || group.activities.length === 0) && (
                            <div className="ml-6 text-sm text-slate-500 italic">
                                No specific activities scheduled yet.
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <button
                        onClick={() => setMembersOpen(!membersOpen)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                        <span className="font-bold text-slate-700 text-sm flex items-center">
                            <UserCircle2 size={16} className="mr-2"/> Participant List
                        </span>
                        {membersOpen ? <ChevronLeft size={16} className="transform rotate-270"/> : <ChevronRight size={16}/>}
                    </button>

                    {membersOpen && (
                        <div className="p-2 bg-white divide-y divide-slate-100">
                            {group.members.map(member => (
                                <div key={member.user_id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{member.name}</p>
                                            <p className="text-[10px] text-slate-500">{member.role}</p>
                                        </div>
                                    </div>
                                    <button className="text-slate-300 hover:text-blue-500 transition-colors">
                                        <MessageCircle size={16}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h5 className="font-bold text-blue-900 text-sm mb-2 flex items-center">
                        <Info size={14} className="mr-2"/> Group Information
                    </h5>
                    <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Open to new members</li>
                        <li>• Casual and friendly atmosphere</li>
                        <li>• All skill levels welcome</li>
                    </ul>
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-white">
                <button
                    onClick={handleJoinGroup}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                >
                    <User size={18} />
                    Join Group
                </button>
            </div>
        </div>
    );
};

// All Groups Panel Component
const AllGroupsPanel = ({ groups, onSelectGroup, onClose }) => {
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = ['all', 'sports', 'social', 'food', 'tech', 'outdoor', 'arts'];

    const filteredGroups = groups.filter(group => {
        const matchesSearch = group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleJoinGroup = (group) => {
        console.log(`Joined group: ${group.title}`);
        setSelectedGroup(null);
    };

    if (selectedGroup) {
        return (
            <div className="absolute top-4 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 flex flex-col max-h-[calc(100vh-2rem)]">
                <GroupDetailView
                    group={selectedGroup}
                    onBack={() => setSelectedGroup(null)}
                    onJoinGroup={handleJoinGroup}
                />
            </div>
        );
    }

    return (
        <div className="absolute top-4 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 flex flex-col max-h-[calc(100vh-2rem)]">
            {/* Header */}
            <div className="p-4 bg-white border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900">All Groups</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search groups..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                selectedCategory === category
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Groups List */}
            <div className="flex-1 overflow-y-auto">
                {filteredGroups.length > 0 ? (
                    <div className="p-4 space-y-4">
                        {filteredGroups.map(group => (
                            <div
                                key={group.group_id}
                                onClick={() => setSelectedGroup(group)}
                                className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                            {group.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 flex items-center mt-1">
                                            <Clock size={12} className="mr-1" /> {group.time}
                                        </p>
                                    </div>
                                    <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full capitalize">
                                        {group.category}
                                    </span>
                                </div>

                                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                                    {group.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-2">
                                            {group.members.slice(0, 3).map((member) => (
                                                <div key={member.user_id} className="w-6 h-6 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                                                    {member.name.charAt(0)}
                                                </div>
                                            ))}
                                            {group.members.length > 3 && (
                                                <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                                                    +{group.members.length - 3}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-500">
                                            {group.members.length} members
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <MapPin size={12} />
                                        {group.location}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Users size={24} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">No groups found</h3>
                        <p className="text-slate-500 text-sm">
                            {searchTerm || selectedCategory !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'No groups available at the moment'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const NavButton = ({ active, onClick, icon: Icon, label }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${active ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
        <Icon size={20} />
        <span className="hidden md:block text-sm">{label}</span>
    </button>
);

// Main App Component
const App = () => {
    const [user, setUser] = useState({ name: "Anna", email: "anna@test.de" });
    const [currentView, setCurrentView] = useState('loading');
    const [places, setPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [activeTab, setActiveTab] = useState('map');
    const [userLocation, setUserLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [allGroups, setAllGroups] = useState([]);

    // Extract all groups from places
    useEffect(() => {
        if (places.length > 0) {
            const groups = places.flatMap(place =>
                (place.properties.groups || []).map(group => ({
                    ...group,
                    location: place.properties.name,
                    category: place.properties.types[0] || 'social'
                }))
            );
            setAllGroups(groups);
        }
    }, [places]);

    const checkLogin = () => {
        const storedUser = localStorage.getItem('munichConnectUser');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser.isLoggedIn) {
                    if (parsedUser.setupComplete) {
                        setUser(parsedUser);
                        setCurrentView('app');
                    } else if (parsedUser.name && parsedUser.age && parsedUser.gender && parsedUser.gender !== 'select') {
                        setUser(parsedUser);
                        setCurrentView('interests');
                    } else {
                        setUser(parsedUser);
                        setCurrentView('setup');
                    }
                } else {
                    setCurrentView('login');
                }
            } catch (e) {
                setCurrentView('login');
            }
        } else {
            setCurrentView('login');
        }
    };

    useEffect(() => {
        checkLogin();
    }, []);

    useEffect(() => {
        if (currentView === 'app' && userLocation) {
            getUserLocation();
            fetchPlacesFromAPI();
        }
    }, [currentView, userLocation]);

    const fetchPlacesFromAPI = async () => {
        try {
            if (!userLocation) return;

            const mood = "🎨 Art & Culture"; // You can make this dynamic based on user preferences
            const placesData = await EventService.fetchPlaces(
                mood,
                userLocation.lat,
                userLocation.lon
            );
            setPlaces(placesData);
        } catch (error) {
            console.error('Error fetching places:', error);
            // Fallback to mock data
            EventService.getMockPlaces().then(setPlaces);
        }
    };
    const getUserLocation = () => {
        setLocationLoading(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by this browser");
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lon: longitude });
                setLocationLoading(false);
            },
            (error) => {
                setLocationLoading(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError("Location access denied by user");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setLocationError("Location information unavailable");
                        break;
                    case error.TIMEOUT:
                        setLocationError("Location request timed out");
                        break;
                    default:
                        setLocationError("An unknown error occurred");
                        break;
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    };

    const handleLogout = () => {
        localStorage.removeItem('munichConnectUser');
        setUser(null);
        setCurrentView('login');
    };

    if (currentView === 'loading') {
        return <div className="flex h-screen items-center justify-center bg-slate-50">Loading...</div>;
    }

    if (currentView === 'login') {
        return <LoginScreen onLoginSuccess={checkLogin} />;
    }

    if (currentView === 'setup') {
        return <SetupScreen onSetupComplete={checkLogin} />;
    }

    if (currentView === 'interests') {
        return <InterestsScreen onInterestsComplete={checkLogin} />;
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
            {/* Sidebar Navigation */}
            <aside className="w-16 md:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 z-30 shadow-sm">
                <div>
                    <div className="p-4 flex items-center gap-3 justify-center md:justify-start">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                            <MapIcon className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg hidden md:block">Munich<span className="text-blue-600">Connect</span></span>
                    </div>
                    <nav className="mt-6 px-2 space-y-1">
                        <NavButton active={activeTab === 'map'} onClick={() => setActiveTab('map')} icon={MapIcon} label="Discover" />
                        <NavButton active={activeTab === 'list'} onClick={() => setActiveTab('list')} icon={List} label="All Groups" />
                        <NavButton active={activeTab === 'fav'} onClick={() => setActiveTab('fav')} icon={Star} label="My Events" />
                    </nav>
                </div>
                <div className="p-4 border-t border-slate-100 hidden md:block">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">{user?.name || 'User'}</p>
                            <button
                                onClick={handleLogout}
                                className="text-xs text-red-500 hover:text-red-700 flex items-center"
                            >
                                <LogOut size={10} className="mr-1"/> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 flex flex-col min-w-0 relative">
                <div className="flex-1 relative overflow-hidden">
                    {activeTab === 'map' && (
                        <>
                            <InteractiveMap
                                places={places}
                                onSelectPlace={setSelectedPlace}
                                selectedId={selectedPlace?.properties.id}
                                userLocation={userLocation}
                                onLocateUser={getUserLocation}
                            />
                            <PlaceDetailPanel
                                place={selectedPlace}
                                onClose={() => setSelectedPlace(null)}
                            />

                            {locationLoading && (
                                <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg z-30 flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm font-medium">Getting your location...</span>
                                </div>
                            )}

                            {locationError && (
                                <div className="absolute top-4 left-4 bg-red-50 px-4 py-2 rounded-lg shadow-lg z-30 flex items-center gap-2">
                                    <span className="text-sm font-medium text-red-700">{locationError}</span>
                                    <button
                                        onClick={getUserLocation}
                                        className="text-red-700 hover:text-red-900 font-bold"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'list' && (
                        <>
                            <InteractiveMap
                                places={places}
                                onSelectPlace={setSelectedPlace}
                                selectedId={selectedPlace?.properties.id}
                                userLocation={userLocation}
                                onLocateUser={getUserLocation}
                            />
                            <AllGroupsPanel
                                groups={allGroups}
                                onSelectGroup={(group) => {
                                    // Find the place that contains this group and select it
                                    const placeWithGroup = places.find(p =>
                                        p.properties.groups?.some(g => g.group_id === group.group_id)
                                    );
                                    if (placeWithGroup) {
                                        setSelectedPlace(placeWithGroup);
                                    }
                                }}
                                onClose={() => setActiveTab('map')}
                            />
                        </>
                    )}

                    {activeTab === 'fav' && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                                <Star className="text-yellow-600 w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">My Events</h2>
                            <p className="text-slate-600 mb-6 max-w-md">
                                Events you've joined or created will appear here. Start exploring groups to build your event list!
                            </p>
                            <button
                                onClick={() => setActiveTab('list')}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Browse All Groups
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;