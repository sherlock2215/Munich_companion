// src/components/Groups/GroupsView.jsx
import React, { useState, useEffect } from 'react';
import { groupService } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import GroupCard from './GroupCard';
import CreateGroupModal from './CreateGroupModal';
import './GroupsView.css';

function GroupsView() {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const { currentUser } = useUser();

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [groups, searchTerm, selectedLocation]);

  const loadGroups = async () => {
    try {
      // Hier würden wir alle Gruppen laden - für Demo verwenden wir nearby groups
      const nearbyGroups = await groupService.getNearby(48.1351, 11.5820);
      setGroups(nearbyGroups);
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  const filterGroups = () => {
    let filtered = groups;

    if (searchTerm) {
      filtered = filtered.filter(group =>
        group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLocation) {
      filtered = filtered.filter(group =>
        group.location_id.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredGroups(filtered);
  };

  const handleCreateGroup = async (groupData) => {
    try {
      await groupService.create({
        ...groupData,
        host: currentUser
      });
      setShowCreateModal(false);
      loadGroups(); // Reload groups
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleJoinGroup = async (groupId, locationId) => {
    try {
      await groupService.join({
        group_id: groupId,
        location_id: locationId,
        user: currentUser
      });
      loadGroups(); // Reload to update members
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  return (
    <div className="groups-view">
      <div className="groups-header">
        <h1>Available Groups</h1>
        <button
          className="create-group-btn"
          onClick={() => setShowCreateModal(true)}
          disabled={!currentUser}
        >
          Create Group
        </button>
      </div>

      <div className="groups-filters">
        <input
          type="text"
          placeholder="Search groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <input
          type="text"
          placeholder="Filter by location..."
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="location-filter"
        />
      </div>

      <div className="groups-grid">
        {filteredGroups.map(group => (
          <GroupCard
            key={group.group_id}
            group={group}
            onJoin={handleJoinGroup}
            currentUser={currentUser}
          />
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="no-groups">
          <p>No groups found. Create the first one!</p>
        </div>
      )}

      {showCreateModal && (
        <CreateGroupModal
          onSubmit={handleCreateGroup}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

export default GroupsView;