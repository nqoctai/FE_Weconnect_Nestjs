import React, { createContext, useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

export const socket = io("http://localhost:8080", {
  autoConnect: false,
  auth: {
    token: localStorage.getItem("access_token"), // Sửa đúng key
  },
});

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

const SocketProvider = ({ children }) => {
  const token = useSelector((store) => store.auth.accessToken);
  console.log("Socket token:", token);

  useEffect(() => {
    if (token) {
      socket.auth = {
        token: token, // Sửa đúng key
      };
      socket.connect();

      socket.on("connect", () => {
        console.log("Connected to socket server");
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from socket server");
      });

      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.disconnect();
      };
    }
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
