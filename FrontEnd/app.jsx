import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    MapPin, Calendar, Clock, Search, User, LogOut,
    Navigation, Map as MapIcon, List, Star,
    ChevronRight, ChevronDown, ChevronLeft, Shield, Zap, Filter, X, Plus, Minus, Locate,
    Mountain, Mail, Github, UserCircle2, ArrowRight, MessageCircle,
    Users, Info, MapPin as MapPinIcon, CheckCircle2, MoreHorizontal
} from 'lucide-react';

// ==========================================
// 1. SERVICES & CONFIG (MOCK DATA ENHANCED)
// ==========================================

const EventService = {
    fetchPlaces: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        type: "Feature",
                        geometry: { type: "Point", coordinates: [11.575858, 48.139972] },
                        properties: {
                            id: "1",
                            name: "Kunsthalle der Hypo-Kulturstiftung",
                            mood: "🎨 Art & Culture",
                            address: "Theatinerstraße 8, München",
                            rating: 4.6,
                            price_level: 0,
                            types: ["museum", "gallery"],
                            total_ratings: 3555,
                            open_now: true,
                            "marker-color": "#4ECDC4",
                            groups: [
                                {
                                    group_id: 101,
                                    title: "Deutsches Museum Tour",
                                    description: "Wir gehen die größten Museen durch",
                                    time: "14:00",
                                    activities: [
                                        { time: "14:00", title: "Treffpunkt", desc: "Vor dem Haupteingang" },
                                        { time: "14:15", title: "Rundgang Start", desc: "Abteilung Luftfahrt" },
                                        { time: "16:00", title: "Kaffeepause", desc: "Im Museumscafé" }
                                    ],
                                    members: [
                                        { user_id: 1, name: "Anna", age: 25, role: "Host" },
                                        { user_id: 2, name: "Bernd", age: 28, role: "Member" },
                                        { user_id: 99, name: "Charlie", age: 24, role: "Member" }
                                    ]
                                },
                                {
                                    group_id: 102,
                                    title: "Kunst & Kaffee",
                                    description: "Erst Ausstellung, dann Cappuccino",
                                    time: "16:30",
                                    activities: [
                                        { time: "16:30", title: "Einlass", desc: "Gruppenticket holen" },
                                        { time: "18:00", title: "Diskussion", desc: "Über die Exponate" }
                                    ],
                                    members: [
                                        { user_id: 3, name: "Clara", age: 22, role: "Host" },
                                        { user_id: 4, name: "David", age: 31, role: "Member" },
                                        { user_id: 5, name: "Elena", age: 27, role: "Member" }
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        type: "Feature",
                        geometry: { type: "Point", coordinates: [11.5788164, 48.1493738] },
                        properties: {
                            id: "2",
                            name: "AMUSEUM of Contemporary Art",
                            mood: "🎨 Art & Culture",
                            address: "Schellingstraße 3, München",
                            rating: 4.4,
                            price_level: 0,
                            types: ["museum", "street-art"],
                            total_ratings: 60,
                            open_now: false,
                            "marker-color": "#FF6B6B",
                            groups: [
                                {
                                    group_id: 103,
                                    title: "Street Art Walk",
                                    description: "Foto-Tour durch das Museum",
                                    time: "10:00",
                                    activities: [
                                        { time: "10:00", title: "Start", desc: "Eingangshalle" },
                                        { time: "11:30", title: "Workshop", desc: "Graffiti Basics" }
                                    ],
                                    members: [
                                        { user_id: 6, name: "Fabian", age: 24, role: "Host" }
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        type: "Feature",
                        geometry: { type: "Point", coordinates: [11.5699981, 48.1366127] },
                        properties: {
                            id: "3",
                            name: "MUCA - Museum of Urban Art",
                            mood: "🎨 Art & Culture",
                            address: "Hotterstraße 12, München",
                            rating: 4.3,
                            price_level: 0,
                            types: ["museum"],
                            total_ratings: 1126,
                            open_now: true,
                            "marker-color": "#FFE66D",
                            groups: []
                        }
                    }
                ]);
            }, 500);
        });
    }
};

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

const InteractiveMap = ({ places, onSelectPlace, selectedId }) => {
    const [viewport, setViewport] = useState({ lat: 48.1400, lon: 11.5750, zoom: 14 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    const mapRef = useRef(null);

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
                            // FIX: Z-Index angepasst. Max Z-Index für Pins ist 40 (selected) oder 10 (unselected).
                            // Die Sidebar wird > 50 haben.
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

            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20 pointer-events-auto">
                <button onClick={() => setViewport(p => ({ ...p, zoom: Math.min(p.zoom + 1, 18) }))} className="bg-white p-2 rounded-t shadow text-slate-700"><Plus size={20} /></button>
                <button onClick={() => setViewport(p => ({ ...p, zoom: Math.max(p.zoom - 1, 10) }))} className="bg-white p-2 rounded-b shadow text-slate-700"><Minus size={20} /></button>
            </div>
        </div>
    );
};

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

const PlaceDetailPanel = ({ place, onClose }) => {
    const [selectedGroup, setSelectedGroup] = useState(null);

    // Wenn sich der Ort ändert, Group-View resetten
    useEffect(() => {
        setSelectedGroup(null);
    }, [place]);

    if (!place) return null;
    const { properties } = place;

    // FIX: Z-Index auf 50 erhöht, damit es sicher über den Pins liegt (die jetzt max 40 haben)
    return (
        <div className="absolute top-4 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-right duration-300 z-50 flex flex-col max-h-[calc(100vh-2rem)]">

            {selectedGroup ? (
                // View 2: Group Details
                <GroupDetailView group={selectedGroup} onBack={() => setSelectedGroup(null)} />
            ) : (
                // View 1: Place Overview
                <>
                    <div className="h-40 bg-slate-100 relative shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                        <div className="absolute inset-0 opacity-40 mix-blend-multiply" style={{ backgroundColor: properties['marker-color'] || '#3b82f6' }}></div>

                        <button onClick={onClose} className="absolute top-3 right-3 text-white/90 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur rounded-full p-1.5 z-20 transition-all">
                            <X size={20} />
                        </button>

                        <div className="absolute bottom-4 left-4 right-4 z-20">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-white/20 backdrop-blur text-white text-xs font-bold rounded uppercase tracking-wide border border-white/10">
                                    {properties.types[0]}
                                </span>
                                {properties.open_now && (
                                    <span className="flex items-center gap-1 text-green-300 text-xs font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                        Geöffnet
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-white leading-tight shadow-sm">{properties.name}</h2>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-slate-50/50">
                        <div className="p-5 space-y-6">

                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-3">
                                <div className="flex items-start gap-3 text-slate-600">
                                    <MapPinIcon size={18} className="mt-0.5 text-slate-400 shrink-0" />
                                    <p className="text-sm leading-relaxed">{properties.address}</p>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Star size={18} className="text-yellow-400 fill-yellow-400 shrink-0" />
                                    <p className="text-sm font-medium">
                                        {properties.rating}
                                        <span className="text-slate-400 font-normal ml-1">({properties.total_ratings} Bewertungen)</span>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <Users size={18} className="text-blue-600" />
                                        Aktive Gruppen
                                    </h3>
                                    <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                        {properties.groups?.length || 0}
                                    </span>
                                </div>

                                {properties.groups && properties.groups.length > 0 ? (
                                    <div className="space-y-3">
                                        {properties.groups.map(group => (
                                            <div
                                                key={group.group_id}
                                                onClick={() => setSelectedGroup(group)}
                                                className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group relative overflow-hidden cursor-pointer"
                                            >
                                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 transition-all group-hover:w-1.5"></div>

                                                <div className="flex justify-between items-start mb-2 pl-2">
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{group.title}</h4>
                                                        <p className="text-xs text-slate-500 flex items-center mt-1">
                                                            <Clock size={12} className="mr-1" /> {group.time || 'Heute'}
                                                        </p>
                                                    </div>
                                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500"/>
                                                </div>

                                                <p className="text-sm text-slate-600 mb-4 pl-2 line-clamp-2">{group.description}</p>

                                                <div className="flex items-center pl-2">
                                                    <div className="flex -space-x-2">
                                                        {group.members.slice(0, 3).map((member) => (
                                                            <div key={member.user_id} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 relative z-10">
                                                                {member.name.charAt(0)}
                                                            </div>
                                                        ))}
                                                        {group.members.length > 3 && (
                                                            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs text-slate-400 relative z-0">
                                                                +{group.members.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-300">
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <MessageCircle size={24} className="text-slate-300" />
                                        </div>
                                        <p className="text-sm text-slate-500 mb-3">Keine Gruppen hier.</p>
                                        <button className="text-sm text-blue-600 font-bold hover:underline">
                                            Erstelle die erste Gruppe!
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                            <Navigation size={18} />
                            Route berechnen
                        </button>
                    </div>
                </>
            )}
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

    useEffect(() => {
        EventService.fetchPlaces().then(setPlaces);
    }, []);

    // Einfacher Login Screen (ausgeblendet wenn User da ist)
    if (!user) {
        return <div className="h-screen flex items-center justify-center bg-slate-50"><button onClick={() => setUser({ name: "Gast" })} className="bg-blue-600 text-white px-6 py-3 rounded-lg">Login Demo</button></div>;
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
                            />
                            <PlaceDetailPanel
                                place={selectedPlace}
                                onClose={() => setSelectedPlace(null)}
                            />
                        </>
                    )}
                    {activeTab === 'list' && (
                        <div className="p-8 overflow-auto h-full">
                            <h2 className="text-2xl font-bold mb-6">Alle Orte & Gruppen</h2>
                            <div className="grid gap-4">
                                {places.map(place => (
                                    <div key={place.properties.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-lg">{place.properties.name}</h3>
                                            <p className="text-sm text-slate-500">{place.properties.address}</p>
                                            <div className="flex gap-2 mt-2">
                                                {place.properties.groups?.map(g => (
                                                    <span key={g.group_id} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">
                                                        {g.title}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <button className="text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition" onClick={() => { setSelectedPlace(place); setActiveTab('map'); }}>
                                            Anzeigen
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
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