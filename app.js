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
const chatRoute = require("./routes/chat_route");

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
mongoose.set("toJSON", {
  virtuals: true,
  transform: (doc, converted) => {
    delete converted._id;
  },
});
app.use("/api/user", userRoute);
app.use("/api/match", matchRoute);
app.use("/api/chat", chatRoute);
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
      users: [userId, otherUserId],
      messages: [],
    });

    room = await newRoom.save();
  }

  socket.join(roomId);
  console.log(`${userId} joined to ${roomId}`);
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("message", async (msg) => {
    socket.to(roomId).emit("message", msg);
    const message = new Message({
      userId: userId,
      content: msg,
      createdAt: new Date(),
    });

    console.log(room.id);
    // Room.updateOne({ _id: room.id }, { $push: { messages: message } }).catch(
    //   (err) => {
    //     console.log(err);
    //   }
    // );
    await room.updateOne({
      $push: { messages: [message] },
    });
  });
});
app.get("*", (req, res) => {
  res.send("not found");
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
