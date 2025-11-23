import React, { useState, useEffect } from 'react';
import { ApiService } from './services/api';
import InteractiveMap from './components/InteractiveMap';
import GroupView from './components/GroupView';
import ChatbotWidget from './components/ChatbotWidget';
import ChatRoom from './components/ChatRoom';
import RegistrationForm from './components/RegistrationForm';
// Icons importieren
import {
  Search, MapPin, Info, Palette, Beer, Landmark, Trees, Utensils, Dumbbell, Baby, Sparkles, Globe, Users, MessageCircle
} from 'lucide-react';
import './App.css';

// --- MOOD OPTIONS ---
// (Unverändert)
const MOOD_OPTIONS = [
  { value: "🌍 Everything", label: "Everything" },
  { value: "🎉 Party / Pub Crawl", label: "Party & Nightlife" },
  { value: "🎨 Art & Culture", label: "Art & Culture" },
  { value: "🏛️ History", label: "History & Museums" },
  { value: "🌿 Nature / Relax", label: "Nature & Parks" },
  { value: "🍽️ Food Tour", label: "Food & Dining" },
  { value: "⚽ Sports & Activities", label: "Sports & Action" },
  { value: "👨‍👨‍👧 Family Friendly", label: "Family Friendly" },
  { value: "💫 Hidden Gems", label: "Hidden Gems" }
];

// --- ICON HELPER ---
// (Unverändert)
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

  // NEUER STATE FÜR DEN ANGEMELDETEN BENUTZER (Startet immer als null)
  const [currentUser, setCurrentUser] = useState(null);

  // Navigation State
  const [mainTab, setMainTab] = useState("search");
  const [myGroups, setMyGroups] = useState([]);
  const [selectedGlobalGroup, setSelectedGlobalGroup] = useState(null);

  // Filter State
  const [searchMood, setSearchMood] = useState("🌍 Everything");
  const [searchRadius, setSearchRadius] = useState(2000);
  const [viewLat, setViewLat] = useState(48.1372);
  const [viewLng, setViewLng] = useState(11.5755);

  // --- ENTFERNT: Der useEffect-Hook, der localStorage ausliest, wird gelöscht. ---
  /*
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
    }
  }, []);
  */

  // --- INITIAL LOAD & DATA FETCHERS (Startet nur, wenn currentUser gesetzt wird) ---
  useEffect(() => {
    if (!currentUser) return;

    // 2. GEOLOCATION UND ERSTE SUCHE
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setUserLocation(loc);
          setViewLat(loc.lat);
          setViewLng(loc.lon);
          triggerSearch(loc.lat, loc.lon, searchMood, searchRadius);
        },
        () => triggerSearch(viewLat, viewLng, searchMood, searchRadius)
      );
    } else {
      triggerSearch(viewLat, viewLng, searchMood, searchRadius);
    }
  }, [currentUser]);

  useEffect(() => {
      if (!currentUser) return;
      if (mainTab === "my_groups") {
          loadMyGroups();
      }
  }, [mainTab, currentUser]);

  const loadMyGroups = async () => {
      setLoading(true);
      try {
          // Verwende currentUser.user_id
          const groups = await ApiService.getUserGroups(currentUser.user_id);
          setMyGroups(groups || []);
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const triggerSearch = async (lat, lng, mood, radius) => {
    setLoading(true);
    try {
        const result = await ApiService.getNearbyPlaces(lat, lng, mood, radius);
        const features = result.features || [];
        setRawPlaces(features);
        const formatted = dataFormatter(features);
        setMapPlaces(formatted);
    } catch (e) {
        console.error("Search failed:", e);
        setMapPlaces([]);
    } finally {
        setLoading(false);
    }
  };

  const handleSearchClick = () => {
    triggerSearch(viewLat, viewLng, searchMood, searchRadius);
  };

  const dataFormatter = (features) => {
    return features.map(f => {
        if (f.properties.type !== 'user') {
            f.properties.groups = [];
        }
        return f;
    });
  };


  const selectedPlace = mapPlaces.find(p => p.properties.id === selectedPlaceId);

  // --- HANDLER FÜR REGISTRIERUNG ---
  const handleRegisterSuccess = (user) => {
    // Wird aufgerufen, sobald das Registrierungsformular erfolgreich war
    setCurrentUser(user);
  };

  // --- FRÜHER RETURN FÜR REGISTRIERUNG ---
  if (!currentUser) {
    // Das Formular wird IMMER angezeigt, wenn kein aktiver Benutzer vorhanden ist.
    return <RegistrationForm onRegisterSuccess={handleRegisterSuccess} />;
  }

  // --- RENDER DER HAUPT-APP (wenn currentUser vorhanden) ---
  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <div className="sidebar" style={{ color: '#1e293b', display: 'flex', flexDirection: 'column' }}>
        {/* ... Rest der Sidebar-Logik (unverändert) */}
        {/* MAIN TAB SWITCHER */}
        <div style={{display: 'flex', padding: '10px', gap: '10px', background: '#f1f5f9', margin: '10px', borderRadius: '12px'}}>
            <button onClick={() => {setMainTab("search"); setSelectedGlobalGroup(null); setSelectedPlaceId(null);}}
                style={{flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', background: mainTab === 'search' ? 'white' : 'transparent', color: mainTab === 'search' ? '#2563eb' : '#64748b', boxShadow: mainTab === 'search' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none'}}>
                <Search size={16} style={{verticalAlign: 'middle', marginRight: '5px'}}/> Search
            </button>
            <button onClick={() => setMainTab("my_groups")}
                style={{flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', background: mainTab === 'my_groups' ? 'white' : 'transparent', color: mainTab === 'my_groups' ? '#2563eb' : '#64748b', boxShadow: mainTab === 'my_groups' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none'}}>
                <Users size={16} style={{verticalAlign: 'middle', marginRight: '5px'}}/> My Groups
            </button>
        </div>

        {/* --- CONTENT: MY GROUPS TAB --- */}
        {mainTab === "my_groups" && (
            <div style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                {selectedGlobalGroup ? (
                    <ChatRoom
                        locationId={selectedGlobalGroup.location_id}
                        groupId={selectedGlobalGroup.group_id}
                        title={selectedGlobalGroup.title}
                        // Übergabe des echten Benutzers
                        user={currentUser}
                        onBack={() => setSelectedGlobalGroup(null)}
                    />
                ) : (
                    <div className="sidebar-content" style={{paddingTop: '0'}}>
                         <h2 style={{margin: '10px 0 15px 0', fontSize: '20px', color: '#0f172a', padding: '0 15px'}}>My Groups</h2>
                         {myGroups.length === 0 && !loading && <div style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>You haven't joined any groups yet.</div>}
                         {myGroups.map(group => (
                             <div key={group.group_id} onClick={() => setSelectedGlobalGroup(group)}
                                style={{margin: '0 15px 10px 15px', padding: '15px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'}}>
                                <div>
                                    <h4 style={{margin: 0, color: '#0f172a'}}>{group.title}</h4>
                                    <small style={{color: '#64748b'}}>Click to chat</small>
                                </div>
                                <MessageCircle size={20} color="#2563eb"/>
                             </div>
                         ))}
                    </div>
                )}
            </div>
        )}

        {/* --- CONTENT: SEARCH TAB --- */}
        {mainTab === "search" && (
            <>
                {selectedPlace ? (
                    <GroupView
                        place={selectedPlace}
                        // Übergabe des echten Benutzers
                        user={currentUser}
                        onBack={() => setSelectedPlaceId(null)}
                    />
                ) : (
                    <>
                        <div className="sidebar-header">
                        <h2 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>Munich Companion</h2>
                        <div className="filter-controls">
                            <div className="control-group">
                            <label style={{ color: '#64748b' }}>Category</label>
                            <div style={{ position: 'relative' }}>
                                <select className="mood-select" value={searchMood} onChange={(e) => setSearchMood(e.target.value)} style={{ paddingLeft: '35px', color: '#0f172a', backgroundColor: 'white', border: '1px solid #cbd5e1' }}>
                                {MOOD_OPTIONS.map(m => (<option key={m.value} value={m.value} style={{color: 'black'}}>{m.label}</option>))}
                                </select>
                                <div style={{ position: 'absolute', left: '10px', top: '10px', pointerEvents: 'none', color: '#64748b' }}>{getIconForMood(searchMood)}</div>
                            </div>
                            </div>
                            <div className="control-group">
                            <label style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>Radius <span className="radius-value" style={{color: '#2563eb'}}>{(searchRadius / 1000).toFixed(1)} km</span></label>
                            <input type="range" className="radius-slider" min="500" max="20000" step="500" value={searchRadius} onChange={(e) => setSearchRadius(Number(e.target.value))} style={{cursor: 'pointer'}} />
                            </div>
                            <button className="btn-primary" onClick={handleSearchClick} disabled={loading} style={{ marginTop: '10px' }}>{loading ? 'Loading...' : <><Search size={18} /> Find Places</>}</button>
                        </div>
                        </div>

                        <div className="sidebar-content">
                        {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}><div className="spinner" style={{ margin: '0 auto 10px auto', borderColor: '#e2e8f0', borderTopColor: '#2563eb' }}></div>Searching...</div>}
                        {!loading && mapPlaces.length === 0 && <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}><Info size={40} style={{ marginBottom: '10px', opacity: 0.5 }} /><p>No places found.</p><small>Try a larger radius.</small></div>}

                        {mapPlaces.map((place) => {
                            if (place.properties.type === 'user') return null;
                            return (
                            <div key={place.properties.id} className="place-card" onClick={() => setSelectedPlaceId(place.properties.id)} style={{background: 'white', color: '#1e293b'}}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <div style={{ background: '#e0f2fe', padding: '8px', borderRadius: '8px', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getIconForMood(searchMood)}</div>
                                <div><h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>{place.properties.name}</h4><p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{place.properties.address}</p></div>
                                </div>
                            </div>
                            );
                        })}
                        </div>
                    </>
                )}
            </>
        )}
      </div>

      {/* MAP */}
      <div style={{ width: '100%', height: '100%' }}>
        <InteractiveMap
          places={mapPlaces}
          onSelectPlace={(p) => {if(p.properties.type!=='user') {setSelectedPlaceId(p.properties.id); setMainTab("search");}}}
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

      {/* CHATBOT */}
      <ChatbotWidget userLocation={userLocation} />
    </div>
  );
}

export default App;