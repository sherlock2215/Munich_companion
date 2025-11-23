// src/components/Matching/MatchingView.jsx
import React, { useState, useEffect } from 'react';
import { matchingService } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import MatchCard from './MatchCard';
import ProfileSetup from './ProfileSetup';
import './MatchingView.css';

function MatchingView() {
  const [matches, setMatches] = useState([]);
  const [interests, setInterests] = useState({});
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useUser();

  useEffect(() => {
    loadInterests();
    if (currentUser) {
      checkProfileSetup();
    }
  }, [currentUser]);

  const loadInterests = async () => {
    try {
      const interestData = await matchingService.getInterests();
      setInterests(interestData);
    } catch (error) {
      console.error('Failed to load interests:', error);
    }
  };

  const checkProfileSetup = () => {
    // Check if user has matching profile setup
    const hasProfile = currentUser.interests && currentUser.interests.length > 0;
    setShowProfileSetup(!hasProfile);
  };

  const findMatches = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const matches = await matchingService.findMatches({
        current_user_id: currentUser.user_id.toString(),
        max_distance_km: 10,
        min_match_score: 20
      });
      setMatches(matches.matches || []);
    } catch (error) {
      console.error('Failed to find matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSave = async (profileData) => {
    try {
      await matchingService.addUserProfile({
        user_id: currentUser.user_id.toString(),
        name: currentUser.name,
        age: currentUser.age,
        ...profileData
      });
      setShowProfileSetup(false);
      findMatches();
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  return (
    <div className="matching-view">
      <div className="matching-header">
        <h1>Find Companions</h1>
        <p>Meet people with similar interests in Munich</p>
      </div>

      {showProfileSetup ? (
        <ProfileSetup
          interests={interests}
          onSave={handleProfileSave}
          currentUser={currentUser}
        />
      ) : (
        <>
          <div className="matching-controls">
            <button
              className="find-matches-btn"
              onClick={findMatches}
              disabled={isLoading}
            >
              {isLoading ? 'Finding Matches...' : 'Find Matches'}
            </button>
            <button
              className="edit-profile-btn"
              onClick={() => setShowProfileSetup(true)}
            >
              Edit Profile
            </button>
          </div>

          <div className="matches-grid">
            {matches.map(match => (
              <MatchCard
                key={match.user.user_id}
                match={match}
                onStartChat={() => {/* Implement chat creation */}}
              />
            ))}
          </div>

          {matches.length === 0 && !isLoading && (
            <div className="no-matches">
              <p>No matches found yet. Click "Find Matches" to discover people!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MatchingView;