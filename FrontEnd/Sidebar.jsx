import {Calendar, Clock, X} from "lucide-react";
import React from "react";

const EventDetailPanel = ({ event, onClose }) => {
    if (!event) return null;
    return (
        <div className="absolute top-4 right-4 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-right duration-300 z-40">
            <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 relative p-4 flex flex-col justify-end">
                <button onClick={onClose} className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/20 rounded-full p-1">
                    <X size={18} />
                </button>
                <h2 className="text-xl font-bold text-white leading-tight">{event.title}</h2>
            </div>
            <div className="p-5 space-y-4">
                <div className="flex justify-between border-b pb-4">
                    <div className="flex items-center text-slate-600 text-sm">
                        <Calendar size={16} className="mr-2" /> {event.date}
                    </div>
                    <div className="flex items-center text-slate-600 text-sm">
                        <Clock size={16} className="mr-2" /> {event.time}
                    </div>
                </div>
                <p className="text-slate-600 text-sm">{event.description}</p>
                <button className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium">Ticket: {event.price}</button>
            </div>
        </div>
    );
};
