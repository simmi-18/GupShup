const db = require("../../db/index");
const { encryptMessage, decryptMessage } = require("../utils/encryption");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const AddChat = async (req, res) => {
  const { user_id, room_id, message, time, file_url, reply_to_id } = req.body;
  const files = req.files;

  if (
    !user_id ||
    !room_id ||
    (!message && !file_url && (!files || files.length === 0))
  ) {
    return res.status(400).json({ message: "Missing fields are required!" });
  }

  try {
    const user = await db("users").where({ id: user_id }).first();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const encryptedMessage = message ? encryptMessage(message) : null;
    const uploadedFiles = [];

    // Local uploads
    if (files?.length > 0) {
      files.forEach((f) => uploadedFiles.push(f.filename));
    }

    // External file URLs (download to /uploads)
    if (file_url) {
      const urls = Array.isArray(file_url) ? file_url : [file_url];
      for (const url of urls) {
        try {
          const ext = path.extname(url.split("?")[0]);
          const uniqueName = `${Date.now()}-${Math.floor(
            Math.random() * 1e9
          )}${ext}`;
          const uploadPath = path.join(__dirname, "../../uploads", uniqueName);
          const response = await axios.get(url, { responseType: "stream" });

          await new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(uploadPath);
            response.data.pipe(writer);
            writer.on("finish", resolve);
            writer.on("error", reject);
          });
          uploadedFiles.push(uniqueName);
        } catch (err) {
          console.error("Error downloading external file:", err.message);
        }
      }
    }

    // Insert message and return inserted ID
    const [insertedId] = await db("messages").insert({
      user_id,
      room_id,
      message: encryptedMessage,
      time,
      file_url: JSON.stringify(uploadedFiles),
      reply_to_id: reply_to_id || null,
    });
    // console.log("files", files, file_url, uploadedFiles);
    // Build new message object in one go
    const newMessage = {
      id: insertedId,
      user_id: user_id,
      room: room_id,
      author: user.name,
      message: message || "",
      file_url: uploadedFiles, // array form for frontend
      time,
      reply_to_id: reply_to_id || null,
    };

    res.status(200).json({
      message: "Chat added successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error Saving Chat:", error);
    res.status(500).json({ message: "Error Saving Chat" });
  }
};

const EditChat = async (req, res) => {
  const { id, user_id, message } = req.body;
  console.log(id, user_id, message);
  if (!id) return res.status(400).json({ message: "id is required!" });
  if (!message) return res.status(400).json({ message: "Nothing to update" });

  try {
    const chat = await db("messages").where("id", id).first();
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (chat.user_id !== user_id) {
      return res
        .status(403)
        .json({ message: "You can only edit your own messages" });
    }
    // const encryptedMessage = message ? encryptMessage(message) : chat.message;
    const encryptedMessage = encryptMessage(message);

    const updatedCount = await db("messages")
      .where({ id })
      .update({ message: encryptedMessage, edited: 1 });

    if (updatedCount === 0) {
      return res.status(404).json({ message: "Update failed. Row not found." });
    }

    const updatedMessage = await db("messages").where("id", id).first();
    const decryptedMessage = {
      ...updatedMessage,
      message: decryptMessage(updatedMessage.message),
      edited: updatedMessage.edited,
    };
    res.status(200).json({
      message: "Chat updated successfully",
      updatedMessage: decryptedMessage,
    });
  } catch (error) {
    console.error("Error updating chat:", error);
    res.status(500).json({ message: "Error updating chat" });
  }
};

const getChat = async (req, res) => {
  const { room } = req.params;
  try {
    const messages = await db("messages as m")
      .join("users as u", "m.user_id", "u.id") // join users to get name
      .leftJoin("messages as r", "m.reply_to_id", "r.id") // replied message
      .leftJoin("users as ru", "r.user_id", "ru.id") // replied message author
      .select(
        "m.id",
        "m.room_id",
        "m.user_id",
        "u.name as author",
        "m.message",
        "m.file_url",
        "m.time",
        "m.reply_to_id",
        "m.edited",
        "r.id as reply_id",
        "r.message as reply_message",
        "r.file_url as reply_file_url",
        "ru.name as reply_author",
        "r.edited as reply_edited"
      )
      .where("m.room_id", room)
      .orderBy("m.time", "asc");

    const decryptedMessages = messages.map((msg) => ({
      id: msg.id,
      user_id: msg.user_id,
      room: msg.room_id,
      author: msg.author,
      message: msg.message ? decryptMessage(msg.message) : "",
      file_url: msg.file_url ? JSON.parse(msg.file_url) : [],
      time: msg.time,
      edited: msg.edited === 1,
      replyTo: msg.reply_to_id
        ? {
            id: msg.reply_to_id,
            author: msg.reply_author,
            message: msg.reply_message ? decryptMessage(msg.reply_message) : "",
            file_url: msg.reply_file_url ? JSON.parse(msg.reply_file_url) : [],
            edited: msg.reply_edited === 1,
          }
        : null,
    }));

    res.status(200).json({
      message: "User fetched chat successfully!",
      result: decryptedMessages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

const DeleteChat = async (req, res) => {
  const { id, user_id } = req.body;
  if (!id || !user_id) {
    return res.status(400).json({ message: "id and user_id is required!" });
  }
  try {
    const chat = await db("messages").where({ id }).first();
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chat.user_id !== user_id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own messages!" });
    }
    const room_id = chat.room_id;
    console.log("room_id", room_id);
    await db("messages").where({ id }).del();
    res.status(200).json({ message: "Chat deleted successfully", id, room_id });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ message: "Error deleting chat" });
  }
};

// const getUserStatus = async (userList) => {
//   const usernames = userList.map((u) => u.username);
//   const dbUsers = await db("users").whereIn("name", usernames);

//   return dbUsers.map((user) => ({
//     username: user.name,
//     online: user.online_status === "online",
//   }));
// };

const getUserStatus = async (room) => {
  const dbUsers = await db("users")
    .select("name", "online_status")
    .where({ room_id });

  return dbUsers.map((user) => ({
    username: user.name,
    online: user.online_status === "online",
  }));
};

module.exports = {
  AddChat,
  EditChat,
  getChat,
  DeleteChat,
  getUserStatus,
};
