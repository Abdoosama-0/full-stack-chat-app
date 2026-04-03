"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import{useUserData} from "../store/userData"

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { token } = useUserData();
  useEffect(() => {

  
        if (!token) return;


    const newSocket = io("http://localhost:5000", {
       query: { token },
      //  withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected:", newSocket.id);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
