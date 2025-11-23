// src/contexts/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:8000');

    newSocket.on('connect', () => {
      setConnected(true);
      console.log('Connected to WebSocket server');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from WebSocket server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const subscribeToGroup = (groupId, messageHandler) => {
    if (socket) {
      socket.emit('subscribe', groupId);
      socket.on('message', messageHandler);
    }
  };

  const unsubscribeFromGroup = (groupId, messageHandler) => {
    if (socket) {
      socket.emit('unsubscribe', groupId);
      socket.off('message', messageHandler);
    }
  };

  const sendMessage = async (messageData) => {
    // Use HTTP API for sending messages, WebSocket is for receiving
    const response = await fetch('http://localhost:8000/chat/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });
    return response.json();
  };

  const value = {
    socket,
    connected,
    subscribeToGroup,
    unsubscribeFromGroup,
    sendMessage
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};gob