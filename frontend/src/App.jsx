import { useState, useEffect } from 'react';
import { ApiService } from './services/api';
import InteractiveMap from './components/InteractiveMap';
import GroupView from './components/GroupView';
// Icons importieren
import {
  Search,
  MapPin,
  Info,
  Palette,        // Art & Culture
  Beer,           // Party
  Landmark,       // History
  Trees,          // Nature
  Utensils,       // Food
  Dumbbell,       // Sports
  Baby,           // Family
  Sparkles,       // Hidden Gems
  Globe           // Everything
} from 'lucide-react';
import './App.css';

// --- MOCK USER ---
const CURRENT_USER = {
  user_id: 999,
  name: "Demo User",
  age: 24,
  gender: "divers"
};

// --- MOOD OPTIONS ---
const MOOD_OPTIONS = [
  { value: "🌍 Everything", label: "Alles anzeigen" },
  { value: "🎉 Party / Pub Crawl", label: "Party & Nightlife" },
  { value: "🎨 Art & Culture", label: "Kunst & Kultur" },
  { value: "🏛️ History", label: "Geschichte & Museen" },
  { value: "🌿 Nature / Relax", label: "Natur & Parks" },
  { value: "🍽️ Food Tour", label: "Essen & Gastro" },
  { value: "⚽ Sports & Activities", label: "Sport & Action" },
  { value: "👨‍👨‍👧 Family Friendly", label: "Familie & Kinder" },
  { value: "💫 Hidden Gems", label: "Geheimtipps" }
];

// --- ICON HELPER ---
const getIconForMood = (moodValue) => {
  switch (moodValue) {
    case "🎉 Party / Pub Crawl": return <Beer size={18} />;
    case "🎨 Art & Culture": return <Palette size={18} />;
    case "🏛️ History": return <Landmark size={18} />;
    case "🌿 Nature / Relax": return <Trees size={18} />;
    case "🍽️ Food Tour": return <Utensils size={18} />;
    case "⚽ Sports & Activities": return <Dumbbell size={18} />;
    case "👨‍👨‍👧 Family Friendly": return <Baby size={18} />;
    case "💫 Hidden Gems": return <Sparkles size={18} />;
    case "🌍 Everything": return <Globe size={18} />;
    default: return <MapPin size={18} />;
  }
};

function App() {
  // --- STATE ---
  const [rawPlaces, setRawPlaces] = useState([]);
  const [mapPlaces, setMapPlaces] = useState([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [searchMood, setSearchMood] = useState("🌍 Everything");
  const [searchRadius, setSearchRadius] = useState(2000);

  // Viewport (München Default)
  const [viewLat, setViewLat] = useState(48.1372);
  const [viewLng, setViewLng] = useState(11.5755);

  // --- INITIAL LOAD ---
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setUserLocation(loc);
          setViewLat(loc.lat);
          setViewLng(loc.lon);
          triggerSearch(loc.lat, loc.lon, searchMood, searchRadius);
        },
        () => {
          triggerSearch(viewLat, viewLng, searchMood, searchRadius);
        }
      );
    } else {
      triggerSearch(viewLat, viewLng, searchMood, searchRadius);
    }
  }, []);

  // --- API SEARCH ---
  const triggerSearch = async (lat, lng, mood, radius) => {
    setLoading(true);
    setRawPlaces([]);

    try {
      const data = await ApiService.getNearbyPlaces(lat, lng, mood, radius);

      if (data && data.features) {
        setRawPlaces(data.features);
      } else if (Array.isArray(data)) {
        setRawPlaces(data);
      } else {
        setRawPlaces([]);
      }
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => {
    const targetLat = userLocation ? userLocation.lat : viewLat;
    const targetLng = userLocation ? userLocation.lon : viewLng;
    triggerSearch(targetLat, targetLng, searchMood, searchRadius);
  };

  // --- DATA FORMATTER ---
  useEffect(() => {
    if (!rawPlaces || rawPlaces.length === 0) {
      setMapPlaces([]);
      return;
    }

    const formatted = rawPlaces.map((item, index) => {
      // Fall 1: GeoJSON Feature
      if (item.type === "Feature" && item.geometry) {
        return {
          ...item,
          properties: {
            ...item.properties,
            id: item.properties.id || item.id || `place-${index}`
          }
        };
      }
      // Fall 2: Flaches Objekt (Fallback)
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [item.lng || 11.5, item.lat || 48.1]
        },
        properties: {
          id: item.place_id || index,
          name: item.name || "Unbekannter Ort",
          address: item.vicinity || "Keine Adresse",
          mood: searchMood,
          ...item
        }
      };
    });

    setMapPlaces(formatted);
  }, [rawPlaces, searchMood]);

  // Helper
  const selectedPlace = mapPlaces.find(p => p.properties.id === selectedPlaceId);

  // --- RENDER ---
  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <div className="sidebar" style={{ color: '#1e293b' }}> {/* WICHTIG: Textfarbe erzwungen */}
        {selectedPlace ? (
          <GroupView
            place={selectedPlace}
            user={CURRENT_USER}
            onBack={() => setSelectedPlaceId(null)}
          />
        ) : (
          <>
            <div className="sidebar-header">
              <h2 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>Munich Companion</h2>

              <div className="filter-controls">
                {/* Mood Select */}
                <div className="control-group">
                  <label style={{ color: '#64748b' }}>Kategorie</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      className="mood-select"
                      value={searchMood}
                      onChange={(e) => setSearchMood(e.target.value)}
                      style={{
                          paddingLeft: '35px',
                          color: '#0f172a',     // Text Schwarz
                          backgroundColor: 'white', // Hintergrund Weiß
                          border: '1px solid #cbd5e1'
                      }}
                    >
                      {MOOD_OPTIONS.map(m => (
                        <option key={m.value} value={m.value} style={{color: 'black', background: 'white'}}>{m.label}</option>
                      ))}
                    </select>
                    <div style={{ position: 'absolute', left: '10px', top: '10px', pointerEvents: 'none', color: '#64748b' }}>
                      {getIconForMood(searchMood)}
                    </div>
                  </div>
                </div>

                {/* Radius Slider */}
                <div className="control-group">
                  <label style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    Radius <span className="radius-value" style={{color: '#2563eb'}}>{(searchRadius / 1000).toFixed(1)} km</span>
                  </label>
                  <input
                    type="range"
                    className="radius-slider"
                    min="500" max="20000" step="500"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(Number(e.target.value))}
                    style={{cursor: 'pointer'}}
                  />
                </div>

                <button
                  className="btn-primary"
                  onClick={handleSearchClick}
                  disabled={loading}
                  style={{ marginTop: '10px' }}
                >
                  {loading ? 'Lade...' : <><Search size={18} /> Orte finden</>}
                </button>
              </div>
            </div>

            {/* List Content */}
            <div className="sidebar-content">
              {loading && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <div className="spinner" style={{ margin: '0 auto 10px auto', borderColor: '#e2e8f0', borderTopColor: '#2563eb' }}></div>
                  Suche läuft...
                </div>
              )}

              {!loading && mapPlaces.length === 0 && (
                <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                  <Info size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                  <p>Keine Orte gefunden.</p>
                  <small>Versuche einen größeren Radius.</small>
                </div>
              )}

              {mapPlaces.map((place) => {
                const isUser = place.properties.type === 'user';
                if (isUser) return null;

                return (
                  <div
                    key={place.properties.id}
                    className="place-card"
                    onClick={() => setSelectedPlaceId(place.properties.id)}
                    style={{background: 'white', color: '#1e293b'}} // Karten Hintergrund Weiß
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{
                        background: '#e0f2fe',
                        padding: '8px',
                        borderRadius: '8px',
                        color: '#0284c7',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {getIconForMood(searchMood)}
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>
                          {place.properties.name}
                        </h4>
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                          {place.properties.address}
                        </p>
                        {place.properties.rating > 0 && (
                          <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold' }}>
                            ★ {place.properties.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* MAP */}
      <div style={{ width: '100%', height: '100%' }}>
        <InteractiveMap
          places={mapPlaces}
          onSelectPlace={(place) => {
            if (place.properties.type !== 'user') {
              setSelectedPlaceId(place.properties.id);
            }
          }}
          selectedId={selectedPlaceId}
          userLocation={userLocation}
          onLocateUser={() => {
            if (userLocation) {
              setViewLat(userLocation.lat);
              setViewLng(userLocation.lon);
              triggerSearch(userLocation.lat, userLocation.lon, searchMood, searchRadius);
            }
          }}
        />
      </div>

    </div>
  );
}

export default App;
