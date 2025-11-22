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

export default EventService;