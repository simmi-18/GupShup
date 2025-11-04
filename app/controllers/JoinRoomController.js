const db = require("../../db/index");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");

const AddRoom = async (req, res) => {
  let { username, room } = req.body;
  const profileImage = req.file ? req.file.filename : null;
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
      await db("users")
        .where({ id: existingUser.id })
        .update({
          updated_at: new Date(),
          online_status: "online",
          profile_image: profileImage
            ? profileImage
            : existingUser.profile_image,
        });

      return res.status(200).json({
        message: "User reconnected successfully!",
        result: {
          username,
          room,
          id: existingUser.id,
          profile_image: existingUser.profile_image,
        },
      });
    }

    const [newUserId] = await db("users").insert(
      {
        name: username,
        room_id: room,
        online_status: "online",
        profile_image: profileImage,
        created_at: new Date(),
        updated_at: new Date(),
      },
      ["id"]
    );

    res.status(200).json({
      message: "New user joined successfully!",
      result: {
        id: newUserId.id,
        username,
        room,
        profile_image: profileImage,
      },
    });
  } catch (error) {
    console.error("Error Saving Join Room:", error);
    res.status(500).json({ message: "Error Saving Join Room" });
  }
};

const getRoom = async (req, res) => {
  try {
    const { id, username, room } = req.query;

    if (!username || !room) {
      return res.status(400).json({
        success: false,
        message: "Username and room are required",
      });
    }
    const user = await db("users")
      .where({ name: username, room_id: room })
      .select("id", "name", "room_id", "profile_image")
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fetch User Room Successfully!!",
      data: {
        id: user.id,
        username: user.name,
        room: user.room_id,
        profileImage: user.profile_image,
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
};

module.exports = {
  AddRoom,
  getRoom,
};
