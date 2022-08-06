const { Server } = require("socket.io");
const logger = require("./logger");
const { commentService } = require("../services");

const { createServer } = require("https");

const { readFileSync } = require("fs");
const { resolve } = require("path");
const { nanoid } = require("nanoid");
const authSocket = require("../middlewares/authSocket");
const c = require("config");

let io;

const existSocketId = [];

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

const handleJsonMessage = (socket, jsonMessage) => {
  switch (jsonMessage.action) {
    case "start":
      existSocketId.push(socket.id);
      console.log(existSocketId);
      emitMessage(socket, { action: "start", id: socket.id });
      break;
    default:
      let remotePeerSocket;
      if (!jsonMessage.data.remoteId) {
        let randomIndex = getRandomInt(0, existSocketId.length - 1);
      } else {
        remotePeerSocket = getSocketById(socket, jsonMessage.data.remoteId);
        if (!remotePeerSocket) {
          return console.log(
            "failed to find remote socket with id",
            jsonMessage.data.remoteId
          );
        }
      }
      // console.log(remotePeerSocket
      if (jsonMessage.action !== "offer") {
        delete jsonMessage.data.remoteId;
      } else {
        jsonMessage.data.remoteId = socket.id;
      }

      emitMessage(remotePeerSocket, jsonMessage);
  }
};

const emitMessage = (socket, jsonMessage) => {
  // console.log(JSON.stringify(jsonMessage));
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
    const httpServer = createServer(
      {
        cert: readFileSync(resolve(__dirname, "../ssl/cert.pem")),
        key: readFileSync(resolve(__dirname, "../ssl/cert.key")),
      },
      app
    );
    // const httpServer = createServer(app);
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

      socket.on("client-to-server-comment", async (value) => {
        console.log(value);
        if (authSocket(value.refreshToken, io).error) {
          return;
        }

        const movieId = value.movieId;
        const content = value.content;
        const userId = value.user._id;
        const commentId = value.commentId;
        let comment = await commentService.postComment(
          movieId,
          content,
          userId,
          commentId
        );
        io.emit("server-to-client-comment", comment);
      });
      socket.on("client-to-server-like", async (value) => {
        if (authSocket(value.refreshToken, io).error) {
          return;
        }
        const commentId = value.commentId;
        const user = value.user;
        const comment = await commentService.likeComment(commentId, user._id);
        io.emit("server-to-client-like", comment);
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
