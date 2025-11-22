
// ==========================================
// 2. MAP ENGINE (Interactive Zoom/Pan)
// ==========================================

// Hilfsfunktionen für Web Mercator Projektion
import {Calendar, Clock, List, Map as MapIcon, Star, X} from "lucide-react";
import React, {useEffect, useState} from "react";

const TILE_SIZE = 256;

const lat2y = (lat) => {
    let sin = Math.sin(lat * Math.PI / 180);
    // Clip latitude to prevent singularity at poles
    sin = Math.min(Math.max(sin, -0.9999), 0.9999);
    return (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * TILE_SIZE;
};

const lon2x = (lon) => {
    return (lon + 180) / 360 * TILE_SIZE;
};

const InteractiveMap = ({ events, onSelectEvent, selectedId }) => {
    // Initial Viewport: München Zentrum
    const [viewport, setViewport] = useState({
        lat: 48.1374,
        lon: 11.5755,
        zoom: 13
    });

    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    const mapRef = useRef(null);

    // --- PANNING LOGIC ---
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY, startLat: viewport.lat, startLon: viewport.lon });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !dragStart) return;

        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        // Pixel Delta in Geo-Delta umrechnen
        // Je höher der Zoom, desto weniger Geo-Verschiebung pro Pixel
        const scale = Math.pow(2, viewport.zoom);
        const deltaLon = -(dx / scale) * (360 / TILE_SIZE);
        const deltaLat = (dy / scale) * (360 / TILE_SIZE) * 0.5; // Einfache Annäherung für Panning

        setViewport(prev => ({
            ...prev,
            lat: dragStart.startLat + deltaLat,
            lon: dragStart.startLon + deltaLon
        }));
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragStart(null);
    };

    // --- ZOOM LOGIC ---
    const handleWheel = (e) => {
        // Verhindert Scrollen der Seite
        // e.preventDefault(); // In React passive events beachten, hier oft tricky.

        const zoomSensitivity = 0.001;
        const newZoom = Math.min(Math.max(viewport.zoom - e.deltaY * zoomSensitivity, 10), 18);

        setViewport(prev => ({ ...prev, zoom: newZoom }));
    };

    const zoomIn = () => setViewport(p => ({ ...p, zoom: Math.min(p.zoom + 1, 18) }));
    const zoomOut = () => setViewport(p => ({ ...p, zoom: Math.max(p.zoom - 1, 10) }));

    // --- TILE CALCULATION ---
    // Berechnet welche Kacheln sichtbar sind basierend auf Viewport
    const tiles = useMemo(() => {
        const scale = Math.pow(2, Math.floor(viewport.zoom)); // Integer Zoom für Tiles
        const centerPixelX = lon2x(viewport.lon) * scale;
        const centerPixelY = lat2y(viewport.lat) * scale;

        // Screen Abmessungen (angenommen)
        const screenW = 1200;
        const screenH = 800;

        const minX = Math.floor((centerPixelX - screenW/2) / TILE_SIZE);
        const maxX = Math.floor((centerPixelX + screenW/2) / TILE_SIZE);
        const minY = Math.floor((centerPixelY - screenH/2) / TILE_SIZE);
        const maxY = Math.floor((centerPixelY + screenH/2) / TILE_SIZE);

        const visibleTiles = [];
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                visibleTiles.push({ x, y, z: Math.floor(viewport.zoom) });
            }
        }
        return visibleTiles;
    }, [viewport]);

    return (
        <div
            className={`w-full h-full bg-slate-200 relative overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            ref={mapRef}
        >
            {/* 1. TILE LAYER */}
            <div className="absolute inset-0 pointer-events-none">
                {tiles.map((tile) => {
                    // Position relativ zum Zentrum berechnen für weiches Panning
                    const scale = Math.pow(2, tile.z);
                    // Aktuelle genaue Pixel-Position des Map-Zentrums bei diesem Tile-Zoom-Level
                    const centerPxX = lon2x(viewport.lon) * scale;
                    const centerPxY = lat2y(viewport.lat) * scale;

                    // Offset dieses Tiles vom Zentrum
                    const left = (tile.x * TILE_SIZE - centerPxX) + (mapRef.current?.clientWidth || 800) / 2;
                    const top = (tile.y * TILE_SIZE - centerPxY) + (mapRef.current?.clientHeight || 600) / 2;

                    // Skalierung für flüssigen Zoom zwischen Integer-Levels
                    const scaleDiff = Math.pow(2, viewport.zoom - tile.z);

                    return (
                        <img
                            key={`${tile.x}-${tile.y}-${tile.z}`}
                            src={`https://tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`}
                            alt=""
                            className="absolute max-w-none"
                            style={{
                                width: TILE_SIZE * scaleDiff,
                                height: TILE_SIZE * scaleDiff,
                                transform: `translate(${left}px, ${top}px) scale(${scaleDiff})`,
                                transformOrigin: 'top left',
                                opacity: 1 // Layering vermeiden
                            }}
                            draggable={false}
                        />
                    );
                })}
            </div>

            {/* 2. MARKER LAYER */}
            <div className="absolute inset-0 pointer-events-none">
                {events.map(evt => {
                    // Exakte Projektion für Marker
                    const scale = Math.pow(2, viewport.zoom);
                    const worldX = lon2x(evt.coordinates[0]) * scale;
                    const worldY = lat2y(evt.coordinates[1]) * scale;

                    const centerPxX = lon2x(viewport.lon) * scale;
                    const centerPxY = lat2y(viewport.lat) * scale;

                    const screenX = (worldX - centerPxX) + (mapRef.current?.clientWidth || 800) / 2;
                    const screenY = (worldY - centerPxY) + (mapRef.current?.clientHeight || 600) / 2;

                    const isSelected = selectedId === evt.id;

                    return (
                        <div
                            key={evt.id}
                            className="absolute pointer-events-auto transition-transform"
                            style={{
                                transform: `translate(${screenX}px, ${screenY}px) translate(-50%, -100%)`,
                                zIndex: isSelected ? 50 : 10
                            }}
                            onClick={(e) => { e.stopPropagation(); onSelectEvent(evt); }}
                        >
                            <div className={`relative group transition-all duration-200 ${isSelected ? 'scale-125' : 'hover:scale-110'}`}>
                                <MapPin
                                    size={40}
                                    className={`drop-shadow-lg ${isSelected ? 'text-blue-600 fill-white' : 'text-slate-700 fill-white'}`}
                                />
                                {isSelected && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full animate-ping" />}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 3. CONTROLS */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20 pointer-events-auto">
                <button onClick={zoomIn} className="bg-white p-2 rounded-t shadow hover:bg-slate-50 text-slate-700"><Plus size={20} /></button>
                <button onClick={zoomOut} className="bg-white p-2 rounded-b shadow hover:bg-slate-50 text-slate-700"><Minus size={20} /></button>
                <div className="h-2"></div>
                <button
                    onClick={() => setViewport({ lat: 48.1374, lon: 11.5755, zoom: 13 })}
                    className="bg-white p-2 rounded shadow hover:bg-slate-50 text-blue-600"
                    title="Zentrum"
                >
                    <Locate size={20} />
                </button>
            </div>

            {/* Attribution */}
            <div className="absolute bottom-1 right-1 bg-white/80 px-1 text-[10px] text-slate-500 z-10 pointer-events-none">
                © OpenStreetMap
            </div>
        </div>
    );
};