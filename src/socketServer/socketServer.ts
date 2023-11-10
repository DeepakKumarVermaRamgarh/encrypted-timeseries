import { Server as SocketIOServer } from "socket.io";
import crypto from "node:crypto";
import { connectDB } from "../database/connectDB";
import Message from "../models/message.model";
import http from "http";

const httpServer = http.createServer();
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET"],
  },
});

io.on("connection", (socket) => {
  connectDB();
  console.log("A user connected", socket.id);

  socket.on("encrypted-message", async (dataStream: string) => {
    const messages = dataStream
      .split("|")
      .map((encryptedMessage: string) => {
        const decipher = crypto.createDecipher(
          process.env.ENCRYPTION_ALGORITHM!,
          process.env.SECRET_KEY!
        );

        let decryptedMessage = decipher.update(encryptedMessage, "hex", "utf8");

        decryptedMessage += decipher.final("utf8");

        const message = JSON.parse(decryptedMessage);

        const secretKeyHash = crypto
          .createHash("sha256")
          .update(
            JSON.stringify({
              name: message.name,
              origin: message.origin,
              destination: message.destination,
            })
          )
          .digest("hex");

        if (secretKeyHash !== process.env.SECRET_KEY) {
          return null;
        }

        return message;
      })
      .filter(Boolean);

    const message = await Message.create({ messages });
  });

  socket.on("disconnect", () => {
    console.log(socket.id, " user disconnected");
  });
});

httpServer.listen(5000, () => {
  console.log("server is listening on port @5000");
});
