import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    MapPin, Calendar, Clock, Search, User, LogOut,
    Navigation, Map as MapIcon, List, Star,
    ChevronRight, ChevronDown, ChevronLeft, Shield, Zap, Filter, X, Plus, Minus, Locate,
    Mountain, Mail, Github, UserCircle2, ArrowRight, MessageCircle,
    Users, Info, MapPin as MapPinIcon, CheckCircle2, MoreHorizontal
} from 'lucide-react';

import EventService from './EventService';
import LoginScreen from "./LoginScreen.jsx";


// ==========================================
// 1. SERVICES & CONFIG (MOCK DATA ENHANCED)
// ==========================================



// ==========================================
// 2. MAP ENGINE (Z-INDEX FIXED)
// ==========================================

const TILE_SIZE = 256;

const lat2y = (lat) => {
    let sin = Math.sin(lat * Math.PI / 180);
    sin = Math.min(Math.max(sin, -0.9999), 0.9999);
    return (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * TILE_SIZE;
};

const lon2x = (lon) => {
    return (lon + 180) / 360 * TILE_SIZE;
};

const InteractiveMap = ({ places, onSelectPlace, selectedId, userLocation, onLocateUser }) => {
    const [viewport, setViewport] = useState({ lat: 48.1400, lon: 11.5750, zoom: 14 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    const mapRef = useRef(null);

    // Auto-center on user location when available
    useEffect(() => {
        if (userLocation) {
            setViewport({
                lat: userLocation.lat,
                lon: userLocation.lon,
                zoom: 15
            });
        }
    }, [userLocation]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY, startLat: viewport.lat, startLon: viewport.lon });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !dragStart) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        const scale = Math.pow(2, viewport.zoom);
        const deltaLon = -(dx / scale) * (360 / TILE_SIZE);
        const deltaLat = (dy / scale) * (360 / TILE_SIZE) * 0.5;
        setViewport(prev => ({ ...prev, lat: dragStart.startLat + deltaLat, lon: dragStart.startLon + deltaLon }));
    };

    const handleMouseUp = () => { setIsDragging(false); setDragStart(null); };
    const handleWheel = (e) => {
        const newZoom = Math.min(Math.max(viewport.zoom - e.deltaY * 0.001, 10), 18);
        setViewport(prev => ({ ...prev, zoom: newZoom }));
    };

    const tiles = useMemo(() => {
        const baseZoom = Math.floor(viewport.zoom);
        const scale = Math.pow(2, baseZoom);
        const centerPixelX = lon2x(viewport.lon) * scale;
        const centerPixelY = lat2y(viewport.lat) * scale;
        const screenW = mapRef.current?.clientWidth || 800;
        const screenH = mapRef.current?.clientHeight || 600;
        const scaleDiff = Math.pow(2, viewport.zoom - baseZoom);
        const visibleW = screenW / scaleDiff;
        const visibleH = screenH / scaleDiff;
        const minX = Math.floor((centerPixelX - visibleW/2) / TILE_SIZE);
        const maxX = Math.floor((centerPixelX + visibleW/2) / TILE_SIZE);
        const minY = Math.floor((centerPixelY - visibleH/2) / TILE_SIZE);
        const maxY = Math.floor((centerPixelY + visibleH/2) / TILE_SIZE);
        const visibleTiles = [];
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                visibleTiles.push({ x, y, z: baseZoom });
            }
        }
        return visibleTiles;
    }, [viewport]);

    return (
        <div
            className={`w-full h-full bg-slate-200 relative overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel}
            ref={mapRef}
        >
            {/* Map Tiles */}
            <div className="absolute inset-0 pointer-events-none select-none">
                {tiles.map((tile) => {
                    const scaleDiff = Math.pow(2, viewport.zoom - tile.z);
                    const centerPxX = lon2x(viewport.lon) * Math.pow(2, tile.z);
                    const centerPxY = lat2y(viewport.lat) * Math.pow(2, tile.z);
                    const screenCenterX = (mapRef.current?.clientWidth || 800) / 2;
                    const screenCenterY = (mapRef.current?.clientHeight || 600) / 2;
                    const left = (tile.x * TILE_SIZE - centerPxX) * scaleDiff + screenCenterX;
                    const top = (tile.y * TILE_SIZE - centerPxY) * scaleDiff + screenCenterY;
                    return (
                        <img key={`${tile.x}-${tile.y}-${tile.z}`} src={`https://tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`}
                             className="absolute max-w-none will-change-transform grayscale-[30%]"
                             style={{ width: TILE_SIZE * scaleDiff, height: TILE_SIZE * scaleDiff, transform: `translate(${left}px, ${top}px)` }}
                             draggable={false} alt=""
                        />
                    );
                })}
            </div>

            {/* Place Markers */}
            <div className="absolute inset-0 pointer-events-none">
                {places.map(place => {
                    const currentScale = Math.pow(2, viewport.zoom);
                    const worldX = lon2x(place.geometry.coordinates[0]) * currentScale;
                    const worldY = lat2y(place.geometry.coordinates[1]) * currentScale;
                    const centerWorldX = lon2x(viewport.lon) * currentScale;
                    const centerWorldY = lat2y(viewport.lat) * currentScale;
                    const screenCenterX = (mapRef.current?.clientWidth || 800) / 2;
                    const screenCenterY = (mapRef.current?.clientHeight || 600) / 2;
                    const screenX = (worldX - centerWorldX) + screenCenterX;
                    const screenY = (worldY - centerWorldY) + screenCenterY;
                    const isSelected = selectedId === place.properties.id;
                    const hasGroups = place.properties.groups && place.properties.groups.length > 0;

                    return (
                        <div key={place.properties.id}
                             className="absolute pointer-events-auto transition-transform will-change-transform origin-bottom"
                             style={{ transform: `translate(${screenX}px, ${screenY}px) translate(-50%, -100%)`, zIndex: isSelected ? 40 : 10 }}
                             onClick={(e) => { e.stopPropagation(); onSelectPlace(place); }}
                        >
                            <div className={`relative group transition-all duration-300 ${isSelected ? 'scale-125' : 'hover:scale-110'}`}>
                                <MapPin size={48} className={`drop-shadow-xl ${isSelected ? 'text-blue-600 fill-white' : 'text-slate-700 fill-white'}`} />
                                {hasGroups && (
                                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white transform translate-x-1/3 -translate-y-1/3">
                                        {place.properties.groups.length}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* User Location Marker */}
            {userLocation && (
                <div
                    className="absolute pointer-events-none z-30"
                    style={{
                        transform: `translate(${lon2x(userLocation.lon) * Math.pow(2, viewport.zoom) - (lon2x(viewport.lon) * Math.pow(2, viewport.zoom)) + (mapRef.current?.clientWidth || 800) / 2}px, ${lat2y(userLocation.lat) * Math.pow(2, viewport.zoom) - (lat2y(viewport.lat) * Math.pow(2, viewport.zoom)) + (mapRef.current?.clientHeight || 600) / 2}px) translate(-50%, -50%)`
                    }}
                >
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                    <div className="w-8 h-8 bg-blue-600 rounded-full opacity-20 animate-ping absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
            )}

            {/* Map Controls */}
            <div className="absolute bottom-20 right-6 flex flex-col gap-2 z-20 pointer-events-auto">
                <button
                    onClick={onLocateUser}
                    className="bg-white p-3 rounded-full shadow-lg text-slate-700 hover:bg-slate-50 transition-colors"
                    title="Find my location"
                >
                    <Locate size={20} />
                </button>
                <button onClick={() => setViewport(p => ({ ...p, zoom: Math.min(p.zoom + 1, 18) }))} className="bg-white p-2 rounded-t shadow text-slate-700"><Plus size={20} /></button>
                <button onClick={() => setViewport(p => ({ ...p, zoom: Math.max(p.zoom - 1, 10) }))} className="bg-white p-2 rounded-b shadow text-slate-700"><Minus size={20} /></button>
            </div>
        </div>
    );
};

// Add this as a separate component or in your App component
const LocationPermissionRequest = ({ onGrant, onDeny }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Locate className="text-blue-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Enable Location</h3>
            <p className="text-slate-600 mb-4 text-sm">
                Allow MunichConnect to access your location to show nearby places and groups.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={onDeny}
                    className="flex-1 py-2 px-4 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    Not Now
                </button>
                <button
                    onClick={onGrant}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Allow
                </button>
            </div>
        </div>
    </div>
);

// ==========================================
// 3. UI COMPONENTS (NEW SIDEBAR & GROUP DETAIL)
// ==========================================

const GroupDetailView = ({ group, onBack }) => {
    const [membersOpen, setMembersOpen] = useState(false);

    return (
        <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
            {/* Group Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
                <button onClick={onBack} className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-2 transition-colors">
                    <ChevronLeft size={16} className="mr-1" /> Zurück zum Ort
                </button>
                <h3 className="text-xl font-bold text-slate-900">{group.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                    <span className="flex items-center"><Clock size={14} className="mr-1 text-blue-500"/> {group.time}</span>
                    <span className="flex items-center"><Users size={14} className="mr-1 text-green-500"/> {group.members.length} Teilnehmer</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">

                {/* Timeline / Aktivitäten */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Zeitplan & Aktivitäten</h4>
                    <div className="space-y-0 relative border-l-2 border-slate-100 ml-2">
                        {group.activities?.map((act, i) => (
                            <div key={i} className="mb-6 ml-6 relative">
                                <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-white border-2 border-blue-500"></div>
                                <div className="text-xs font-bold text-blue-600 mb-0.5">{act.time}</div>
                                <h5 className="font-bold text-slate-800 text-sm">{act.title}</h5>
                                <p className="text-xs text-slate-500 mt-1">{act.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mitglieder Accordion */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <button
                        onClick={() => setMembersOpen(!membersOpen)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                        <span className="font-bold text-slate-700 text-sm flex items-center">
                            <UserCircle2 size={16} className="mr-2"/> Teilnehmerliste
                        </span>
                        {membersOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
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
                                    <button className="text-slate-300 hover:text-slate-600">
                                        <MessageCircle size={16}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            <div className="p-4 border-t border-slate-100 bg-white">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-200 transition-all">
                    Der Gruppe beitreten
                </button>
            </div>
        </div>
    );
};



// ==========================================
// 4. APP ROOT
// ==========================================

const App = () => {
    const [user, setUser] = useState({ name: "Anna", email: "anna@test.de" });
    const [places, setPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [activeTab, setActiveTab] = useState('map');
    const [userLocation, setUserLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);

    // Get user's location on component mount
    useEffect(() => {
        getUserLocation();
        EventService.fetchPlaces().then(setPlaces);
    }, []);

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

                // Optional: Auto-center map on user location
                // You might want to pass this to the Map component
                console.log("User location:", latitude, longitude);
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
                        <NavButton active={activeTab === 'map'} onClick={() => setActiveTab('map')} icon={MapIcon} label="Entdecken" />
                        <NavButton active={activeTab === 'list'} onClick={() => setActiveTab('list')} icon={List} label="Alle Gruppen" />
                        <NavButton active={activeTab === 'fav'} onClick={() => setActiveTab('fav')} icon={Star} label="Meine Events" />
                    </nav>
                </div>
                <div className="p-4 border-t border-slate-100 hidden md:block">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">{user.name.charAt(0)}</div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">{user.name}</p>
                            <button onClick={() => setUser(null)} className="text-xs text-red-500 hover:text-red-700 flex items-center"><LogOut size={10} className="mr-1"/> Abmelden</button>
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

                            {/* Location status indicator */}
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
                </div>
            </main>
        </div>
    );
};

const NavButton = ({ active, onClick, icon: Icon, label }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${active ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
        <Icon size={20} />
        <span className="hidden md:block text-sm">{label}</span>
    </button>
);

export default App;