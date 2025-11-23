// src/components/Chat/ChatView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import { useSocket } from '../../contexts/SocketContext';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import './ChatView.css';

function ChatView() {
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const { currentUser } = useUser();
  const { subscribeToGroup, sendMessage } = useSocket();

  useEffect(() => {
    if (currentUser) {
      loadUserGroups();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedGroup) {
      loadChatHistory();
      subscribeToGroup(selectedGroup.group_id, handleNewMessage);
    }
  }, [selectedGroup]);

  const loadUserGroups = async () => {
    try {
      const groups = await chatService.getUserGroups(currentUser.user_id);
      setUserGroups(groups);
    } catch (error) {
      console.error('Failed to load user groups:', error);
    }
  };

  const loadChatHistory = async () => {
    try {
      const history = await chatService.getHistory(
        selectedGroup.location_id,
        selectedGroup.group_id,
        currentUser.user_id
      );
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async (content) => {
    if (!selectedGroup || !content.trim()) return;

    try {
      await sendMessage({
        location_id: selectedGroup.location_id,
        group_id: selectedGroup.group_id,
        user: currentUser,
        content: content.trim()
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="chat-view">
      <ChatSidebar
        groups={userGroups}
        selectedGroup={selectedGroup}
        onSelectGroup={setSelectedGroup}
      />

      {selectedGroup ? (
        <ChatWindow
          group={selectedGroup}
          messages={messages}
          onSendMessage={handleSendMessage}
          currentUser={currentUser}
        />
      ) : (
        <div className="chat-placeholder">
          <h2>Select a group to start chatting</h2>
          <p>Join groups from the map or groups view to see them here</p>
        </div>
      )}
    </div>
  );
}

export default ChatView;