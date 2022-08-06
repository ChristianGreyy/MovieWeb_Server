const { Server } = require("socket.io");
const logger = require("./logger");
const { commentService } = require("../services");
// const { createServer } = require("https");
const { createServer } = require("http");
const { readFileSync } = require("fs");
const { resolve } = require("path");
const { nanoid } = require("nanoid");

let io;

const existSocketId = [];

const handleJsonMessage = (socket, jsonMessage) => {
  switch (jsonMessage.action) {
    case "start":
      // console.log(jsonMessage.data.userId);
      socket.id = nanoid();
      // socket.id = jsonMessage.data.userId;
      // console.log(socket);
      socket.join(socket.id);
      emitMessage(socket, { action: "start", id: socket.id });
      break;
    default:
      // console.log("remote", jsonMessage.data.remoteId);
      if (!jsonMessage.data.remoteId) return;

      const remotePeerSocket = getSocketById(socket, jsonMessage.data.remoteId);
      // console.log(remotePeerSocket);
      if (!remotePeerSocket) {
        return console.log(
          "failed to find remote socket with id",
          jsonMessage.data.remoteId
        );
      }

      if (jsonMessage.action !== "offer") {
        delete jsonMessage.data.remoteId;
      } else {
        jsonMessage.data.remoteId = socket.id;
      }

      emitMessage(remotePeerSocket, jsonMessage);
  }
};

const emitMessage = (socket, jsonMessage) => {
  console.log(JSON.stringify(jsonMessage));
  socket.emit("server-to-client", JSON.stringify(jsonMessage));
};

const getSocketById = (socket, socketId) => {
  const arr = io.sockets.sockets;
  let ans;
  arr.forEach((item) => {
    if (item.id == socketId) {
      ans = item;
    }
  });
  return ans;
};

module.exports = {
  init: (app) => {
    // const httpServer = createServer(app);
    const httpServer = createServer(
      {
        cert: readFileSync(resolve(__dirname, "../ssl/cert.pem")),
        key: readFileSync(resolve(__dirname, "../ssl/cert.key")),
      },
      app
    );
    io = new Server(httpServer, {
      cors: {
        origin: "*",
      },
      transports: ["polling"],
      maxHttpBufferSize: 8e6,
    });

    io.on("connection", (socket) => {
      socket.on("message", (data) => {
        console.log("socket::message data=%s", data);

        try {
          const jsonMessage = JSON.parse(data);
          handleJsonMessage(socket, jsonMessage);
        } catch (error) {
          console.error("failed to handle onmessage", error);
        }
      });

      socket.once("close", () => {
        console.log("socket::close");
      });

      socket.on("client-to-server-comment", (value) => {
        console.log(value);
        io.emit("server-to-client-comment", value);
      });
      socket.on("client-to-server-like", (value) => {
        io.emit("server-to-client-like", value);
      });
    });

    httpServer.listen(8080, () => {
      console.log("app server listening on port 8080");
    });
  },
  getIo: () => {
    return io;
  },
};
