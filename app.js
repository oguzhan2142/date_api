const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const http = require("http");
const path = require("path");

const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const tokenMiddleware = require("./middleware/token_middleware");
const userRoute = require("./routes/user_route");
const matchRoute = require("./routes/match_route");

const Room = require("./model/room");
const Message = require("./model/message");

require("dotenv").config();
app.use(bodyParser.json());
app.set("json spaces", 40);
app.use(express.static("public"));

app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");

  next();
});

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.post("/", (req, res) => {
  res.json(req.body);
});
const port = process.env.PORT;
console.log(port);

app.use("/api/user", userRoute);
app.use("/api/match", matchRoute);
app.use(tokenMiddleware.verify);

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
app.get("*", (req, res) => {
  res.send("not found");
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
