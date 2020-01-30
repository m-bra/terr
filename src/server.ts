import { StringCache, LocalCache } from "./shared/cache";
import express from 'express';
import * as http from 'http';
import * as SocketIO from "socket.io";

const cache: StringCache = new LocalCache()

const app = express();

//initialize a simple http server
const server = new http.Server(app);

//initialize the WebSocket server instance
let io = SocketIO.default(server);

io.on("connection", function(socket: any) {
    console.log("a user connected");
    socket.on("message", function(message: any) {
      console.log(message);
      // echo the message back down the
      // websocket connection
      socket.emit("message", message);
    });
  });

//start our server
server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port ${server.address()} :)`);
});
