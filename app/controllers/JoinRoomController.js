const db = require("../../db/index");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");

exports.AddRoom = [
  async (req, res) => {
    let { username, room } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    if (!room) {
      room = uuidv4();
    }

    try {
      const existingUser = await db("users")
        .where({ name: username, room_id: room })
        .first();

      if (existingUser) {
        await db("users").where({ id: existingUser.id }).update({
          updated_at: new Date(),
          online_status: "online",
        });

        return res.status(200).json({
          message: "User reconnected successfully!",
          result: { username, room, id: existingUser.id },
        });
      }

      const [newUserId] = await db("users").insert(
        {
          name: username,
          room_id: room,
          online_status: "online",
          created_at: new Date(),
          updated_at: new Date(),
        },
        ["id"]
      );

      res.status(200).json({
        message: "New user joined successfully!",
        result: { id: newUserId.id, username, room },
      });
    } catch (error) {
      console.error("Error Saving Join Room:", error);
      res.status(500).json({ message: "Error Saving Join Room" });
    }
  },
];


exports.getRoom = [
  async (req, res) => {
    try {
      const { username, room } = req.query;

      const user = await db("users")
        .where({ name: username, room_id: room })
        .select("id", "name", "room_id")
        .first();
      res.status(200).json({
        success: true,
        message: "Fetch User Room Successfully!!",
        data: {
          id: user.id,
          username: user.name,
          room: user.room_id,
        },
      });
    } catch (error) {
      console.error("Error in fetching Room:", error);
      return res.status(500).json({
        success: false,
        error: {
          message: "Internal Server Error",
          code: 500,
        },
      });
    }
  },
];
