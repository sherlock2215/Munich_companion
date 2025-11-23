// src/components/Map/MapView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { groupService, chatbotService } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import LocationMarker from './LocationMarker';
import GroupPopup from './GroupPopup';
import ChatbotPanel from './ChatbotPanel';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

const MUNICH_CENTER = [48.1351, 11.5820];

function MapView() {
  const [userLocation, setUserLocation] = useState(MUNICH_CENTER);
  const [nearbyGroups, setNearbyGroups] = useState([]);
  const [selectedMood, setSelectedMood] = useState('🎨 Art & Culture');
  const [places, setPlaces] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatbotResponse, setChatbotResponse] = useState('');
  const { currentUser } = useUser();
  const mapRef = useRef();

  const moods = [
    '🎉 Party / Pub Crawl',
    '🎨 Art & Culture',
    '🏛️ History',
    '🌿 Nature / Relax',
    '🍽️ Food Tour',
    '⚽ Sports & Activities',
    '👨‍👨‍👧 Family Friendly',
    '💫 Hidden Gems',
    '🌍 Everything'
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        () => {
          console.log('Using default Munich location');
        }
      );
    }
  }, []);

  useEffect(() => {
    loadNearbyGroups();
    loadPlaces();
  }, [userLocation, selectedMood]);

  const loadNearbyGroups = async () => {
    try {
      const groups = await groupService.getNearby(userLocation[0], userLocation[1]);
      setNearbyGroups(groups);
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  const loadPlaces = async () => {
    try {
      const result = await groupService.getNearby(userLocation[0], userLocation[1], selectedMood);
      setPlaces(result.features || []);
    } catch (error) {
      console.error('Failed to load places:', error);
    }
  };

  const handleAskChatbot = async (question) => {
    try {
      const response = await chatbotService.ask(question, userLocation[0], userLocation[1]);
      setChatbotResponse(response.response);
    } catch (error) {
      console.error('Chatbot error:', error);
    }
  };

  return (
    <div className="map-view">
      <div className="map-controls">
        <select
          value={selectedMood}
          onChange={(e) => setSelectedMood(e.target.value)}
          className="mood-selector"
        >
          {moods.map(mood => (
            <option key={mood} value={mood}>{mood}</option>
          ))}
        </select>

        <button
          className="chatbot-toggle"
          onClick={() => setShowChatbot(!showChatbot)}
        >
          🤖 Chatbot
        </button>
      </div>

      <MapContainer
        center={userLocation}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <LocationMarker
          position={userLocation}
          onPositionChange={setUserLocation}
        />

        {places.map(place => (
          <Marker
            key={place.properties.id}
            position={[place.geometry.coordinates[1], place.geometry.coordinates[0]]}
          >
            <Popup>
              <div className="place-popup">
                <h3>{place.properties.name}</h3>
                <p>{place.properties.address}</p>
                <p>⭐ {place.properties.rating || 'N/A'}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {nearbyGroups.map(group => (
          <Marker
            key={group.group_id}
            position={[group.location_lat, group.location_lng]}
          >
            <Popup>
              <GroupPopup group={group} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {showChatbot && (
        <ChatbotPanel
          onAsk={handleAskChatbot}
          response={chatbotResponse}
          onClose={() => setShowChatbot(false)}
        />
      )}
    </div>
  );
}

export default MapView;