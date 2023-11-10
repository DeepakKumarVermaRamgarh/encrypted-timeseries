"use client";

import { useState, useEffect } from "react";
import socketIO from "socket.io-client";
import { initializeSocket } from "./emitter.service";

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const socketId = socketIO(
      process.env.SOCKET_SERVER_URI || "http://localhost:5000",
      {
        transports: ["websocket"],
      }
    );
    socketId.on("connection", () => console.log("connected"));
    socketId.on("encrypted-message", (data) => {
      setMessages((prevMessages) => [...prevMessages, ...data]);
    });
    socketId.on("connect_error", (err) => {
      console.log(`connect_error due to ${err}`);
    });

    return () => {
      socketId.disconnect();
    };
  }, []);

  useEffect(() => {
    initializeSocket();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {messages.map((message: any, index: number) => (
        <div key={index}>
          <p>Name : {message.name}</p>
          <p>Origin : {message.origin}</p>
          <p>Destination : {message.destination}</p>
          <p>CreatedAt : {message.createdAt}</p>
        </div>
      ))}
    </main>
  );
}
