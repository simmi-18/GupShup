const multer = require("multer");
const path = require("path");

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },

  filename: (req, file, cb) => {
    const extension = file.originalname.substring(
      file.originalname.lastIndexOf(".")
    ); // get file extension
    const nameWithoutExt = file.originalname
      .replace(/\.[^/.]+$/, "") // remove extension
      .replace(/\s+/g, "_"); // replace spaces with underscores
    const timestamp = Date.now();
    const uniqueSuffix = Math.round(Math.random() * 1e9);
    const newFilename = `${nameWithoutExt}-${timestamp}-${uniqueSuffix}${extension}`;

    cb(null, newFilename);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
