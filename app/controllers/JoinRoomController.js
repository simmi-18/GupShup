const db = require("../../db/index");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");

exports.AddRoom = [
  async (req, res) => {
    const { username, room } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Missing Fields are required " });
    }
    if (!room) {
      room = uuidv4();
    }
    try {
      await db("users").insert({
        name: username,
        room_id: room,
      });

      res.status(200).json({
        message: "User can Join Room Successfullyy!!!",
        result: { username, room },
      });
    } catch (error) {
      console.error("Error Saving Join Room", error);
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
