// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { SocketProvider } from './contexts/SocketContext';
import Header from './components/UI/Header';
import Navigation from './components/UI/Navigation';
import MapView from './components/Map/MapView';
import GroupsView from './components/Groups/GroupsView';
import ChatView from './components/Chat/ChatView';
import MatchingView from './components/Matching/MatchingView';
import ProfileView from './components/Profile/ProfileView';
import './styles/App.css';

function App() {
  const [currentView, setCurrentView] = useState('map');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'map':
        return <MapView />;
      case 'groups':
        return <GroupsView />;
      case 'chat':
        return <ChatView />;
      case 'matching':
        return <MatchingView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <MapView />;
    }
  };

  return (
    <Router>
      <UserProvider>
        <SocketProvider>
          <div className="app">
            <Header />
            <main className="main-content">
              {renderCurrentView()}
            </main>
            <Navigation currentView={currentView} onViewChange={setCurrentView} />
          </div>
        </SocketProvider>
      </UserProvider>
    </Router>
  );
}

export default App;