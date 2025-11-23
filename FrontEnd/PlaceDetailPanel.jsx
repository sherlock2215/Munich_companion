import React, {useEffect, useState} from "react";
import {ChevronRight, Clock, MapPin as MapPinIcon, MessageCircle, Navigation, Star, Users, X, Calendar, User, UserCircle2, ChevronLeft, CheckCircle2} from "lucide-react";

const GroupDetailView = ({ group, onBack, onJoinGroup }) => {
    const [membersOpen, setMembersOpen] = useState(false);
    const [joinSuccess, setJoinSuccess] = useState(false);

    const handleJoinGroup = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('munichConnectUser'));
            const joinData = {
                location_id: group.location_id, // Make sure this is passed correctly
                group_id: group.group_id,
                user: {
                    user_id: userData.user_id || Date.now(),
                    name: userData.name,
                    age: userData.age,
                    gender: userData.gender
                }
            };

            await apiService.joinGroup(joinData);
            setJoinSuccess(true);

            setTimeout(() => {
                if (onJoinGroup) onJoinGroup(group);
            }, 1500);
        } catch (error) {
            console.error('Error joining group:', error);
            alert('Failed to join group. Please try again.');
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
            {/* Group Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
                <button
                    onClick={onBack}
                    className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-2 transition-colors"
                >
                    <ChevronLeft size={16} className="mr-1" /> Back to Place
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
                {/* Group Description */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">About this Group</h4>
                    <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-lg border border-slate-200">
                        {group.description}
                    </p>
                </div>

                {/* Schedule & Activities */}
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

                {/* Members Accordion */}
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

                {/* Group Rules/Info */}
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

const PlaceDetailPanel = ({ place, onClose }) => {
    const [selectedGroup, setSelectedGroup] = useState(null);

    // Reset group view when place changes
    useEffect(() => {
        setSelectedGroup(null);
    }, [place]);

    if (!place) return null;
    const { properties } = place;

    const handleJoinGroup = (group) => {
        console.log(`Joined group: ${group.title}`);
        // Here you would typically make an API call to join the group
        setSelectedGroup(null); // Go back to place view after joining
    };

    const handleNavigate = () => {
        if (properties.coordinates) {
            const [lng, lat] = properties.coordinates;
            const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
            window.open(url, '_blank');
        }
    };

    return (
        <div className="absolute top-4 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-right duration-300 z-50 flex flex-col max-h-[calc(100vh-2rem)]">

            {selectedGroup ? (
                // View 2: Group Details
                <GroupDetailView
                    group={selectedGroup}
                    onBack={() => setSelectedGroup(null)}
                    onJoinGroup={handleJoinGroup}
                />
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
                                        Open Now
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-white leading-tight shadow-sm">{properties.name}</h2>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-slate-50/50">
                        <div className="p-5 space-y-6">

                            {/* Place Information */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-3">
                                <div className="flex items-start gap-3 text-slate-600">
                                    <MapPinIcon size={18} className="mt-0.5 text-slate-400 shrink-0" />
                                    <p className="text-sm leading-relaxed">{properties.address}</p>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Star size={18} className="text-yellow-400 fill-yellow-400 shrink-0" />
                                    <p className="text-sm font-medium">
                                        {properties.rating}
                                        <span className="text-slate-400 font-normal ml-1">({properties.total_ratings} reviews)</span>
                                    </p>
                                </div>
                                {properties.hours && (
                                    <div className="flex items-start gap-3 text-slate-600">
                                        <Clock size={18} className="mt-0.5 text-slate-400 shrink-0" />
                                        <p className="text-sm leading-relaxed">{properties.hours}</p>
                                    </div>
                                )}
                            </div>

                            {/* Active Groups */}
                            <div>
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <Users size={18} className="text-blue-600" />
                                        Active Groups
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
                                                            <Clock size={12} className="mr-1" /> {group.time || 'Today'}
                                                        </p>
                                                    </div>
                                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500"/>
                                                </div>

                                                <p className="text-sm text-slate-600 mb-4 pl-2 line-clamp-2">{group.description}</p>

                                                <div className="flex items-center justify-between pl-2">
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
                                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                                        {group.members.length} members
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-300">
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <MessageCircle size={24} className="text-slate-300" />
                                        </div>
                                        <p className="text-sm text-slate-500 mb-3">No active groups here yet.</p>
                                        <button className="text-sm text-blue-600 font-bold hover:underline">
                                            Create the first group!
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 bg-white border-t border-slate-100 shrink-0 space-y-3">
                        <button
                            onClick={handleNavigate}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                        >
                            <Navigation size={18} />
                            Get Directions
                        </button>
                        <button className="w-full border border-slate-300 hover:border-slate-400 text-slate-700 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                            <Calendar size={18} />
                            Create New Group
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default PlaceDetailPanel;