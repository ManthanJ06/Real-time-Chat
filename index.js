const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Replace with your Atlas connection string
const uri = process.env.MONGO_URI;
// ✅ DB CONNECT (with error handling)
mongoose
  .connect(uri)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch((err) => console.log("❌ Connection Error:", err));
// USER MODEL
const User = mongoose.model("User", {
  username: String,
  password: String,
});

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).send("User exists");

    const hashed = await bcrypt.hash(password, 10);
    await new User({ username, password: hashed }).save();

    res.send("Registered");
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).send("User not found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).send("Wrong password");

    const token = jwt.sign({ username }, "SECRET");

    res.send({ token, username });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// SOCKET SERVER
// SOCKET SERVER
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

let users = {}; // username -> socket.id

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // ✅ JOIN (THIS WAS MISSING 🔥)
  socket.on("join", (username) => {
    socket.username = username;
    users[username] = socket.id;

    console.log("User joined:", username);

    // send updated user list
    io.emit("users", Object.keys(users));
  });

  // ✅ PRIVATE MESSAGE
  socket.on("private message", ({ from, to, text }) => {
    console.log("MESSAGE:", from, "->", to, ":", text);

    const target = users[to];
    const msg = { from, to, text };

    if (target) {
      io.to(target).emit("private message", msg);
    }

    // send back to sender
    socket.emit("private message", msg);
  });

  // ✅ DISCONNECT
  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.username);

    if (socket.username) {
      delete users[socket.username];
    }

    io.emit("users", Object.keys(users));
  });
});

// START SERVER
server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
