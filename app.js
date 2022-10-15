const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const http = require("http");

const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const tokenMiddleware = require("./middleware/token_middleware");
const userRoute = require("./routes/user_route");
const matchRoute = require("./routes/match_route");

const Room = require("./model/room");
const Message = require("./model/message");

require("dotenv").config();

const port = process.env.PORT;

app.use(bodyParser.json());
app.use("/api/user", userRoute);
app.use("/api/match", matchRoute);
app.use(tokenMiddleware.verify);
app.get("/",(req,res)=>{ res.send("hello")})
mongoose.connect(process.env.CONNECTION_STRING);

const generateRoomId = (userId, otherUserId) => {
  const idList = [userId, otherUserId];
  idList.sort();
  return idList.join("-");
};

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;
  const otherUserId = socket.handshake.query.otherUserId;
  const roomId = generateRoomId(userId, otherUserId);

  var room = await Room.findOne({
    roomId: roomId,
  });
  if (!room) {
    const newRoom = new Room({
      roomId: roomId,
      createdAt: new Date(),
    });

    room = await newRoom.save();
  }

  socket.join(roomId);
  console.log(`${userId} joined to ${roomId}`);
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("message", (msg) => {
    socket.to(roomId).emit("message", msg);
    const message = new Message({
      userId: userId,
      content: msg,
      roomReference: room.id,

      createdAt: new Date(),
    });

    message.save();
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
