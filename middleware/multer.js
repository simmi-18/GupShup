// const multer = require("multer");
// const path = require("path");

// // Multer Storage Setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "../uploads"));
//   },

//   filename: (req, file, cb) => {
//     const extension = file.originalname.substring(
//       file.originalname.lastIndexOf(".")
//     ); // get file extension
//     const nameWithoutExt = file.originalname
//       .replace(/\.[^/.]+$/, "") // remove extension
//       .replace(/\s+/g, "_"); // replace spaces with underscores
//     const timestamp = Date.now();
//     const uniqueSuffix = Math.round(Math.random() * 1e9);
//     const newFilename = `${nameWithoutExt}-${timestamp}-${uniqueSuffix}${extension}`;

//     cb(null, newFilename);
//   },
// });

// const upload = multer({ storage: storage });

// module.exports = upload;

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UPLOAD_DIR = path.join(__dirname, "../uploads");

// Ensure folder exists for Render
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = file.originalname
      .replace(/\.[^/.]+$/, "")
      .replace(/\s+/g, "_");

    const filename = `${base}-${Date.now()}-${Math.random()
      .toString()
      .slice(2)}${ext}`;

    cb(null, filename);
  },
});

module.exports = multer({ storage });
module.exports.UPLOAD_DIR = UPLOAD_DIR;
