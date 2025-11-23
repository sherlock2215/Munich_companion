import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Locate, Plus, Minus } from 'lucide-react';

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

export default InteractiveMap;