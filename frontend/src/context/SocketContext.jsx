import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    return { socket: null, connected: false };
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const authContext = useContext(AuthContext);
  const user = authContext ? authContext.user : null;

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setConnected(true);

        const userId = user._id || user.id;
        if (user.role === 'mechanic') {
          newSocket.emit('mechanic:join', userId);
        } else if (user.role === 'client') {
          newSocket.emit('client:join', userId);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
      };
    }
  }, [user]);

  const value = { socket, connected };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};