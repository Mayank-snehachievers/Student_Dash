const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());


mongoose.connect("mongodb://localhost:27017/test_database", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const doubtSchema = new mongoose.Schema({
  question: String,
  solution: String,
});

const Doubt = mongoose.model("Doubt", doubtSchema);


app.get("/doubts", async (req, res) => {
  const doubts = await Doubt.find();
  res.json(doubts);
});

app.delete("/delete-doubt/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedDoubt = await Doubt.findByIdAndDelete(id);
    
    if (!deletedDoubt) {
      return res.status(404).json({ message: "Doubt not found" });
    }

    io.emit("deleteDoubt", id); 

    res.json({ message: "Doubt deleted", id });
  } catch (error) {
    res.status(500).json({ message: "Error deleting doubt" });
  }
});



app.post("/ask-doubt", async (req, res) => {
  const { question } = req.body;
  const newDoubt = new Doubt({ question: req.body.question, solution: "" });
  await newDoubt.save();
  io.emit("newDoubt", newDoubt); 
  res.json({ message: "Doubt submitted", doubt: newDoubt });
});

app.delete("/delete-doubt/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedDoubt = await Doubt.findByIdAndDelete(id);

    if (!deletedDoubt) {
      return res.status(404).json({ message: "Doubt not found" });
    }

    io.emit("deleteDoubt", id); 
    res.json({ message: "Doubt deleted", id });
  } catch (error) {
    res.status(500).json({ message: "Error deleting doubt" });
  }
});

io.on("connection", (socket) => {
  console.log("Student connected");
  socket.on("disconnect", () => console.log("Student disconnected"));
});


server.listen(8000, () => console.log("Student Backend running on port 8001"));
