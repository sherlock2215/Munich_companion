import React, {useEffect, useState} from "react";
import {ChevronRight, Clock, MapPin as MapPinIcon, MessageCircle, Navigation, Star, Users, X} from "lucide-react";

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

export default PlaceDetailPanel;