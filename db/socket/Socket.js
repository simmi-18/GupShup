const { Server } = require("socket.io");
const { getUserStatus } = require("../../app/controllers/ChatController");

const db = require("..");
const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:4001",
      methods: ["GET", "POST"],
    },
  });

  let users = {};
  const onlineUsers = {};

  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);
    console.log("Total Connected Clients:", io.engine.clientsCount);

    socket.on("join_room", async ({ room, username }) => {
      console.log(`✅ ${username} joined room ${room}`);
      socket.join(room);
      socket.username = username;
      socket.room = room;
      if (!onlineUsers[room]) {
        onlineUsers[room] = new Set();
      }
      onlineUsers[room].add(username);
      await db("users")
        .where({ name: username })
        .update({ online_status: "online" });

      if (!users[room]) users[room] = [];
      // 🧹 Remove any existing entry for this username in the same room
      users[room] = users[room].filter((u) => u.username !== username);

      // ✅ Add fresh user instance
      users[room].push({ id: socket.id, username });
      const userStatus = await getUserStatus(users[room]);
      io.to(room).emit("user_list", userStatus);
      // console.log(`User with ID: ${socket.id} joined room: ${room}`);
    });

    socket.on("send_message", (data) => {
      // console.log("Server received message:", data); // ✅ Add this
      io.to(data.room).emit("receive_message", data);
    });

    socket.on("typing", ({ room, username }) => {
      io.to(room).emit("typing", username);
    });

    socket.on("stop_typing", ({ room, username }) => {
      io.to(room).emit("stop_typing", username);
    });

    socket.on("disconnect", async () => {
      const room = socket.room;
      const username = socket.username;
      if (room && users[room]) {
        users[room] = users[room].filter((u) => u.id !== socket.id);
        if (username) {
          await db("users")
            .where({ name: username })
            .update({ online_status: "offline" });
        }
        const userStatus = await getUserStatus(users[room]);
        io.to(room).emit("user_list", userStatus);
      }
      console.log("❌ User Disconnected:", socket.id);
    });
  });
  return io;
};

module.exports = initializeSocket;
