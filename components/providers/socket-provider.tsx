'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type SocketContextType = {
  socket: WebSocket | null;
  isConnected: boolean;
};

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_WSS_URL!);
    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setSocket(socket);
    };
    socket.onmessage = (event: MessageEvent) => {
      console.log('Received message:', event);
    };
    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setSocket(null);
    };
    return () => {
      socket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
