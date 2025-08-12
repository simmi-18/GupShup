const db = require("../../db/index");
const { encryptMessage, decryptMessage } = require("../utils/encryption");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// const AddChat = async (req, res) => {
//   const { user_id, room_id, message, time, file_url } = req.body;
//   const file = req.file;

//   if (!user_id || !room_id || (!message && !file && !file_url)) {
//     return res.status(400).json({ message: "Missing Fields are Required!!!" });
//   }

//   try {
//     const user = await db("users").where({ id: user_id }).first();
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     let filePath = null;
//     const encryptedMessage = message ? encryptMessage(message) : null;

//     if (file) {
//       filePath = file.filename;
//     } else if (file_url) {
//       // Download the file from the URL and save it to uploads
//       const ext = path.extname(file_url.split("?")[0]); // .gif, .png, etc.
//       const uniqueName = `${Date.now()}-${Math.floor(
//         Math.random() * 1e9
//       )}${ext}`;
//       const uploadPath = path.join(__dirname, "../../uploads", uniqueName);
//       const response = await axios({
//         method: "GET",
//         url: file_url,
//         responseType: "stream",
//       });

//       await new Promise((resolve, reject) => {
//         const writer = fs.createWriteStream(uploadPath);
//         response.data.pipe(writer);
//         writer.on("finish", resolve);
//         writer.on("error", reject);
//       });

//       filePath = uniqueName; // Save just the filename in DB
//     }
//     // console.log("Received file_url:", file_url);
//     // console.log("Received file_url:", filePath);
//     const data = await db("messages").insert({
//       user_id,
//       room_id,
//       message: encryptedMessage,
//       time,
//       file_url: filePath,
//     });

//     res.status(200).json({
//       message: "User chat saved successfully!",
//       result: data,
//       file_url: filePath,
//     });
//   } catch (error) {
//     console.error("Error Saving Add Chat", error);
//     res.status(500).json({ message: "Error Saving Add Chat" });
//   }
// };
// const AddChat = async (req, res) => {
//   const { user_id, room_id, message, time, file_url } = req.body;
//   const file = req.file;

//   if (!user_id || !room_id || (!message && !file && !file_url)) {
//     return res.status(400).json({ message: "Missing Fields are Required!!!" });
//   }

//   try {
//     const user = await db("users").where({ id: user_id }).first();
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     let filePath = null;
//     let originalFileName = null;
//     const encryptedMessage = message ? encryptMessage(message) : null;

//     if (file) {
//       filePath = file.filename;
//       originalFileName = file.originalname;

//       // Save file_url as: <originalname>::<stored_filename>
//       filePath = `${originalFileName}::${filePath}`;
//     } else if (file_url) {
//       const ext = path.extname(file_url.split("?")[0]);
//       const uniqueName = `${Date.now()}-${Math.floor(
//         Math.random() * 1e9
//       )}${ext}`;
//       const uploadPath = path.join(__dirname, "../../uploads", uniqueName);

//       const response = await axios({
//         method: "GET",
//         url: file_url,
//         responseType: "stream",
//       });

//       await new Promise((resolve, reject) => {
//         const writer = fs.createWriteStream(uploadPath);
//         response.data.pipe(writer);
//         writer.on("finish", resolve);
//         writer.on("error", reject);
//       });

//       const originalNameFromURL = path.basename(file_url.split("?")[0]);
//       filePath = `${originalNameFromURL}::${uniqueName}`;
//     }

//     await db("messages").insert({
//       user_id,
//       room_id,
//       message: encryptedMessage,
//       time,
//       file_url: filePath,
//     });

//     res.status(200).json({
//       message: "User chat saved successfully!",
//       file_url: filePath,
//     });
//   } catch (error) {
//     console.error("Error Saving Add Chat", error);
//     res.status(500).json({ message: "Error Saving Add Chat" });
//   }
// };
const AddChat = async (req, res) => {
  const { user_id, room_id, message, time } = req.body;
  const files = req.files; // note: array
  const file_url = req.body.file_url; // optional

  if (!user_id || !room_id || (!message && !files?.length && !file_url)) {
    return res.status(400).json({ message: "Missing fields are required!" });
  }

  try {
    const user = await db("users").where({ id: user_id }).first();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const encryptedMessage = message ? encryptMessage(message) : null;
    const uploadedFiles = [];

    // Handle uploaded files
    if (files?.length) {
      for (const file of files) {
        uploadedFiles.push(file.filename);
      }
    }

    // Optional: Handle external file URL (downloaded)
    if (file_url) {
      const ext = path.extname(file_url.split("?")[0]);
      const uniqueName = `${Date.now()}-${Math.floor(
        Math.random() * 1e9
      )}${ext}`;
      const uploadPath = path.join(__dirname, "../../uploads", uniqueName);
      const response = await axios.get(file_url, { responseType: "stream" });

      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(uploadPath);
        response.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      uploadedFiles.push(uniqueName);
    }

    // Insert one message per file (or just one if message only)
    const inserts = uploadedFiles.length
      ? uploadedFiles.map((file) =>
          db("messages").insert({
            user_id,
            room_id,
            message: encryptedMessage,
            time,
            file_url: file,
          })
        )
      : [
          db("messages").insert({
            user_id,
            room_id,
            message: encryptedMessage,
            time,
            file_url: null,
          }),
        ];

    await Promise.all(inserts);

    res.status(200).json({
      message: "Chat(s) saved successfully!",
      uploaded: uploadedFiles,
    });
  } catch (error) {
    console.error("Error Saving Chat:", error);
    res.status(500).json({ message: "Error Saving Chat" });
  }
};

const getChat = async (req, res) => {
  const { room } = req.params;
  try {
    const messages = await db("messages")
      .where({ room_id: room })
      .orderBy("time", "asc");
    const decryptedMessages = messages.map((msg) => ({
      ...msg,
      message: msg.message ? decryptMessage(msg.message) : null,
    }));
    res.status(200).json({
      message: "User Fetch chat successfullyy!!!!",
      result: decryptedMessages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

const getUserStatus = async (userList) => {
  const usernames = userList.map((u) => u.username);
  const dbUsers = await db("users").whereIn("name", usernames);

  return dbUsers.map((user) => ({
    username: user.name,
    online: user.online_status === "online",
  }));
};

module.exports = {
  AddChat,
  getChat,
  getUserStatus,
};
