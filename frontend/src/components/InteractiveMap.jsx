import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Locate, Plus, Minus, Users } from 'lucide-react';

const TILE_SIZE = 256;

// --- Hilfsfunktionen für Koordinaten-Umrechnung ---
const lat2y = (lat) => {
    let sin = Math.sin(lat * Math.PI / 180);
    sin = Math.min(Math.max(sin, -0.9999), 0.9999);
    return (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * TILE_SIZE;
};

const lon2x = (lon) => {
    return (lon + 180) / 360 * TILE_SIZE;
};

const InteractiveMap = ({ places, onSelectPlace, selectedId, userLocation, onLocateUser }) => {
    // Standard-Ansicht: München
    const [viewport, setViewport] = useState({ lat: 48.1372, lon: 11.5755, zoom: 14 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    const mapRef = useRef(null);

    // Auto-Zentrierung auf User Location
    useEffect(() => {
        if (userLocation) {
            setViewport({
                lat: userLocation.lat,
                lon: userLocation.lon,
                zoom: 15
            });
        }
    }, [userLocation]);

    // --- Maus Events (Drag & Drop der Karte) ---
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
        const deltaLat = (dy / scale) * (360 / TILE_SIZE) * 0.5; // Faktor 0.5 korrigiert Mercator Verzerrung grob beim Draggen
        setViewport(prev => ({ ...prev, lat: dragStart.startLat + deltaLat, lon: dragStart.startLon + deltaLon }));
    };

    const handleMouseUp = () => { setIsDragging(false); setDragStart(null); };

    const handleWheel = (e) => {
        const newZoom = Math.min(Math.max(viewport.zoom - e.deltaY * 0.001, 10), 18);
        setViewport(prev => ({ ...prev, zoom: newZoom }));
    };

    // --- Kacheln berechnen ---
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
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            ref={mapRef}
            // Fallback Inline-Styles, falls Tailwind nicht geht:
            style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#e2e8f0', cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            {/* Map Tiles Layer */}
            <div className="absolute inset-0 pointer-events-none select-none" style={{position: 'absolute', top:0, left:0, right:0, bottom:0, pointerEvents: 'none', userSelect: 'none'}}>
                {tiles.map((tile) => {
                    const scaleDiff = Math.pow(2, viewport.zoom - tile.z);
                    const centerPxX = lon2x(viewport.lon) * Math.pow(2, tile.z);
                    const centerPxY = lat2y(viewport.lat) * Math.pow(2, tile.z);

                    const screenCenterX = (mapRef.current?.clientWidth || 800) / 2;
                    const screenCenterY = (mapRef.current?.clientHeight || 600) / 2;

                    const left = (tile.x * TILE_SIZE - centerPxX) * scaleDiff + screenCenterX;
                    const top = (tile.y * TILE_SIZE - centerPxY) * scaleDiff + screenCenterY;

                    return (
                        <img key={`${tile.x}-${tile.y}-${tile.z}`}
                             src={`https://tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`}
                             className="absolute max-w-none will-change-transform grayscale-[30%]"
                             style={{
                                 position: 'absolute',
                                 width: TILE_SIZE * scaleDiff,
                                 height: TILE_SIZE * scaleDiff,
                                 transform: `translate(${left}px, ${top}px)`,
                                 maxWidth: 'none'
                             }}
                             draggable={false} alt=""
                        />
                    );
                })}
            </div>

            {/* Places Markers Layer */}
            <div className="absolute inset-0 pointer-events-none" style={{position: 'absolute', top:0, left:0, right:0, bottom:0, pointerEvents: 'none'}}>
                {places.map(place => {
                    const currentScale = Math.pow(2, viewport.zoom);
                    // WICHTIG: Hier wird geometry.coordinates erwartet (GeoJSON Format)
                    if(!place.geometry || !place.geometry.coordinates) return null;

                    const worldX = lon2x(place.geometry.coordinates[0]) * currentScale;
                    const worldY = lat2y(place.geometry.coordinates[1]) * currentScale;

                    const centerWorldX = lon2x(viewport.lon) * currentScale;
                    const centerWorldY = lat2y(viewport.lat) * currentScale;

                    const screenCenterX = (mapRef.current?.clientWidth || 800) / 2;
                    const screenCenterY = (mapRef.current?.clientHeight || 600) / 2;

                    const screenX = (worldX - centerWorldX) + screenCenterX;
                    const screenY = (worldY - centerWorldY) + screenCenterY;

                    const isSelected = selectedId === place.properties.id;
                    const groupCount = place.properties.groups?.length || 0;
                    const hasGroups = groupCount > 0;

                    // Marker Farbe abhängig von Gruppenzahl
                    const markerColor = isSelected ? '#2563eb' : (hasGroups ? '#ef4444' : '#334155');

                    return (
                        <div key={place.properties.id}
                             className="absolute pointer-events-auto transition-transform will-change-transform origin-bottom"
                             style={{
                                 position: 'absolute',
                                 transform: `translate(${screenX}px, ${screenY}px) translate(-50%, -100%)`,
                                 zIndex: isSelected ? 40 : (hasGroups ? 20 : 10), // Gruppen-Marker leicht hervorheben
                                 pointerEvents: 'auto',
                                 cursor: 'pointer'
                             }}
                             onClick={(e) => { e.stopPropagation(); onSelectPlace(place); }}
                        >
                            <div className={`relative group transition-all duration-300 ${isSelected ? 'scale-125' : 'hover:scale-110'}`}>
                                <MapPin
                                    size={48}
                                    color={markerColor}
                                    fill="white"
                                />
                                {/* NEUES BADGE MIT GRUPPENANZAHL */}
                                {hasGroups && (
                                    <div style={{
                                        position: 'absolute', top: 0, right: 0,
                                        backgroundColor: '#ef4444', color: 'white',
                                        fontSize: '10px', fontWeight: 'bold',
                                        width: '20px', height: '20px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderRadius: '50%', border: '2px solid white',
                                        transform: 'translate(33%, -33%)'
                                    }}>
                                        {groupCount}
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
                        position: 'absolute',
                        zIndex: 30,
                        pointerEvents: 'none',
                        transform: `translate(${lon2x(userLocation.lon) * Math.pow(2, viewport.zoom) - (lon2x(viewport.lon) * Math.pow(2, viewport.zoom)) + (mapRef.current?.clientWidth || 800) / 2}px, ${lat2y(userLocation.lat) * Math.pow(2, viewport.zoom) - (lat2y(userLocation.lat) * Math.pow(2, viewport.zoom)) + (mapRef.current?.clientHeight || 600) / 2}px) translate(-50%, -50%)`
                    }}
                >
                    <div style={{width: '16px', height: '16px', backgroundColor: '#2563eb', borderRadius: '50%', border: '2px solid white', boxShadow: '0 0 10px rgba(0,0,0,0.3)'}}></div>
                </div>
            )}

            {/* Controls (Zoom Buttons) */}
            <div className="absolute bottom-20 right-6 flex flex-col gap-2 z-20 pointer-events-auto"
                 style={{position: 'absolute', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 20, pointerEvents: 'auto'}}>

                <button onClick={onLocateUser} style={{background: 'white', padding: '10px', borderRadius: '50%', border: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', cursor: 'pointer'}}>
                    <Locate size={20} color="#334155" />
                </button>

                <div style={{display: 'flex', flexDirection: 'column', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', borderRadius: '4px', overflow: 'hidden'}}>
                    <button onClick={() => setViewport(p => ({ ...p, zoom: Math.min(p.zoom + 1, 18) }))}
                            style={{background: 'white', padding: '8px', border: 'none', borderBottom: '1px solid #eee', cursor: 'pointer'}}>
                        <Plus size={20} color="#334155" />
                    </button>
                    <button onClick={() => setViewport(p => ({ ...p, zoom: Math.max(p.zoom - 1, 10) }))}
                            style={{background: 'white', padding: '8px', border: 'none', cursor: 'pointer'}}>
                        <Minus size={20} color="#334155" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InteractiveMap;