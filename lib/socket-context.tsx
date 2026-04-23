/** @format */
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./auth-context";
import { useToast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import { hospitalApi } from "@/store/features/hospital/hospitalSlice";
import { referralApi } from "@/store/features/referral/referralSlice";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const dispatch = useDispatch();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log("Socket effect triggered. User exists?", !!user);
    if (!user) {
      console.log("No user found! Returning early.");
      return;
    }

    const TOKEN_KEY = "mediReferToken";
    const storedToken = localStorage.getItem(TOKEN_KEY);


    const socketBase = process.env.NEXT_PUBLIC_SOCKET_URL;
    console.log(socketBase)
    const socketUrl = `${socketBase}/clinical`;
    console.log("Attempting Clinical WebSocket connection to:", socketUrl);
    
    const socketInstance = io(socketUrl, {
      transports: ["polling", "websocket"],
      auth: {
        token: storedToken,
      },
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socketInstance.on("connect", () => {
      console.log("Connected to Clinical WebSocket as:", user.id);
      setIsConnected(true);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Clinical WebSocket Connection Error:", error);
      setIsConnected(false);
    });

    socketInstance.on("disconnect", () => {
      console.log("Clinical WebSocket Disconnected");
      setIsConnected(false);
    });

    // Global Listeners for "Uber-like" updates
    socketInstance.on("CAPACITY_UPDATED", (data) => {
      console.log("Received CAPACITY_UPDATED:", data);
      // Invalidate the specific hospital and the general list
      dispatch(hospitalApi.util.invalidateTags([
        { type: "Hospital", id: data.hospitalId },
        { type: "Hospital", id: "LIST" },
        "BedCapacity"
      ]));
      
      if (user?.hospitalId === data.hospitalId) {
        toast({
          title: "Capacity Sync",
          description: `Resource updated for ${data.wardType?.replace("_", " ") || 'ward'}.`,
        });
      }
    });

    socketInstance.on("SPECIALIST_UPDATED", (data) => {
      dispatch(hospitalApi.util.invalidateTags([
        { type: "Hospital", id: data.hospitalId },
        { type: "Hospital", id: "LIST" },
        "Specialist"
      ]));
    });

    socketInstance.on("NEW_REFERRAL", (data) => {
       console.log("Incoming Referral Event:", data);
       dispatch(referralApi.util.invalidateTags(["Referral"]));
       
       if (user?.hospitalId === data.hospitalId) {
         toast({
           title: "Incoming Referral",
           description: data.referral?.patientName || "A new clinical transfer request has been received.",
         });
       }
    });

    socketInstance.on("NOTIFICATION_CREATED", (data) => {
      console.log("Live Notification received:", data);
      if (user?.id === data.recipientId) {
        toast({
          title: "New Update",
          description: data.message,
        });
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user, dispatch, toast]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
