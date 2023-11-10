import socketIO from "socket.io-client";
import data from "./data.json";
import crypto from "node:crypto";

export const initializeSocket = () => {
  const socketId = socketIO(
    process.env.SOCKET_SERVER_URI || "http://localhost:5000",
    {
      transports: ["websocket"],
    }
  );

  const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const createEncryptedMessage = (): string => {
    const originalMessage = {
      name: data.names[getRandomInt(0, data.names.length - 1)],
      origin: data.cities[getRandomInt(0, data.cities.length - 1)],
      destination: data.cities[getRandomInt(0, data.cities.length - 1)],
    };

    const secretKeyHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(originalMessage))
      .digest("hex");

    const sumCheckMessage = { ...originalMessage, secretKeyHash };

    const cipher = crypto.createCipher(
      process.env.ENCRYPTION_ALGORITHM!,
      process.env.SECRET_KEY!
    );

    let encryptedMessage = cipher.update(
      JSON.stringify(sumCheckMessage),
      "utf8",
      "hex"
    );

    encryptedMessage += cipher.final("hex");

    return encryptedMessage;
  };

  const sendEncryptedData = () => {
    const numMessages: number = getRandomInt(49, 499);
    const messages: Array<unknown> = [];
    for (let i = 0; i < numMessages; i++) {
      messages.push(createEncryptedMessage());
    }
    socketId.emit("encrypted-message", messages.join("|"));
  };

  setInterval(sendEncryptedData, 10000);
};
