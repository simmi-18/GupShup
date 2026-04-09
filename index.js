require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const initializeSocket = require("./db/socket/Socket");
const authRoutes = require("./routes/Route");

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

app.use(
  cors({
    origin: "https://gup-shup-hazel.vercel.app", // your frontend domain
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);
app.use("/gupshup/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/gupshup", authRoutes);

const PORT = process.env.PORT || 4009;
server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
