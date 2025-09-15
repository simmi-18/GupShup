const express = require("express");
const { AddRoom, getRoom } = require("../app/controllers/JoinRoomController");
const {
  AddChat,
  getChat,
  EditChat,
  DeleteChat,
} = require("../app/controllers/ChatController");
const upload = require("../middleware/multer");
const router = express.Router();

//Join Room
router.post("/add-room", AddRoom);
router.get("/get-room", getRoom);

// Chat Room
router.post("/add-chat", upload.array("files"), AddChat);
router.get("/get-chat/:room", getChat);
router.put("/update-chat", EditChat);
router.delete("/delete-chat", DeleteChat);

module.exports = router;
