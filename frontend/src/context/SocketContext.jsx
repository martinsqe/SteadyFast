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
      // Use the API URL but target the root for socket connection
      const socketUrl = import.meta.env.VITE_API_URL.replace('/api', '');
      console.log('🔌 Initializing socket connection at:', socketUrl);

      const newSocket = io(socketUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      const joinRoom = () => {
        const userId = user._id || user.id;
        if (user.role === 'mechanic') {
          newSocket.emit('mechanic:join', userId);
          console.log('🔧 Mechanic joined room:', userId);
        } else if (user.role === 'client') {
          newSocket.emit('client:join', userId);
          console.log('👤 Client joined room:', userId);
        }
      };

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setConnected(true);
        joinRoom();
      });

      // Re-join room automatically on every reconnect (socket drops + comes back)
      newSocket.on('reconnect', () => {
        console.log('🔄 Socket reconnected — re-joining room');
        joinRoom();
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