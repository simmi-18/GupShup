const { Server } = require("socket.io");
const { getUserStatus } = require("../../app/controllers/ChatController");

const db = require("..");
const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:4001"],
      methods: ["GET", "POST", "PUT"],
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

      await db("users").where({ name: username }).update({
        online_status: "online",
        room_id: room,
        updated_at: new Date(),
      });
      const userStatus = await db("users")
        .select("id", "name as username", "online_status", "room_id")
        .where({ room_id: room });

      io.to(room).emit("user_list", userStatus);
      // console.log(`User with ID: ${socket.id} joined room: ${room}`);
    });

    socket.on("send_message", (data) => {
      console.log("Server received message:", data); // ✅ Add this
      io.to(data.room).emit("receive_message", data);
    });

    socket.on("update_message", (data) => {
      console.log("📢 Broadcasting updated message:", data);
      io.to(data.room).emit("updated_message", data);
    });

    socket.on("delete_message", async (data) => {
      console.log("🗑️ Delete event received:", data);
      io.to(data.room).emit("deleted_message", { id: data.id });
    });

    socket.on("typing", ({ room, username }) => {
      io.to(room).emit("typing", username);
    });

    socket.on("stop_typing", ({ room, username }) => {
      io.to(room).emit("stop_typing", username);
    });

    socket.on("disconnect", async () => {
      try {
        if (!socket.username || !socket.room) return;
        await db("users").where({ name: socket.username }).update({
          online_status: "offline",
          updated_at: new Date(),
        });

        const userStatus = await db("users")
          .select("id", "name as username", "online_status", "room_id")
          .where({ room_id: socket.room });

        io.to(socket.room).emit("user_list", userStatus);
        console.log(`❌ ${socket.username} left ${socket.room}`);
        //  console.log("❌ User Disconnected:", socket.id);
      } catch (err) {
        console.error("disconnect error:", err);
      }
    });
  });
  return io;
};

module.exports = initializeSocket;
