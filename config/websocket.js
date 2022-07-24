const { readFileSync } = require("fs");
const { resolve } = require("path");
const { createServer } = require("https");
const { WebSocketServer, OPEN } = require("ws");

const websocket = () => {
  const wsServer = createServer({
    cert: readFileSync(resolve(__dirname, "../ssl/cert.pem")),
    key: readFileSync(resolve(__dirname, "../ssl/cert.key")),
  });
  const wss = new WebSocketServer({ server: wsServer });

  wss.on("connection", (socket) => {
    console.log("new connection");

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
  });

  const handleJsonMessage = (socket, jsonMessage) => {
    switch (jsonMessage.action) {
      case "start":
        socket.id = nanoid();
        emitMessage(socket, { action: "start", id: socket.id });
        break;
      default:
        console.log("remote", jsonMessage.data.remoteId);
        if (!jsonMessage.data.remoteId) return;

        const remotePeerSocket = getSocketById(jsonMessage.data.remoteId);

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
    if (socket.readyState === OPEN) {
      socket.send(JSON.stringify(jsonMessage));
    }
  };

  const getSocketById = (socketId) => {
    console.log(wss.clients);
    return Array.from(wss.clients).find((client) => client.id === socketId);
  };

  wsServer.listen(8888);
  console.log("wss server listening on port 8888");
};

module.exports = websocket;
