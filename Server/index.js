import express from "express";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import DbCon from "./libs/db.js";
import AuthRoutes from './routes/auth.routes.js';
import memoryBookRoutes from './routes/memoryBookRoutes.js';
import memoryRoutes from './routes/memoryRoutes.js';
import predictedEmotion from './routes/PredictedEmotion.js';
import predictMatch from "./routes/predictMatch.js";
import blogRoutes from "./routes/blogRoutes.js";
import cookieParser from "cookie-parser";
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import { StripeWebhook } from "./controllers/AppointmentController.js";
import imageValidationRouter from './routes/imageValidation.js';
import complaintRoutes from './routes/complaintRoutes.js';

dotenv.config();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
DbCon();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));
app.use(express.urlencoded({ limit: "500mb", extended: true }));
app.use(express.json({ limit: "500mb" }));
app.use('/uploads', express.static(path.join(__dirname,'uploads')));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { httpOnly: true, secure: false, maxAge: 3600000 }
}));

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  StripeWebhook
);


// API routes
app.use((req, res, next) => {
  console.log(`☞ ${req.method} ${req.url}`);
  next();
});
app.use('/auth', AuthRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/memory-books', memoryBookRoutes);
app.use('/api/memory-books', memoryRoutes);
app.use('/pets', predictedEmotion);
app.use('/api', predictMatch);
app.use('/api', imageValidationRouter);
app.use('/api/complaints', complaintRoutes);

// Create HTTP server and attach socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET','POST'],
    credentials: true
  }
});

// Socket.IO signaling handlers
io.on("connection", socket => {
  console.log(`✅ Socket connected: ${socket.id}`);

  socket.on("join-room", ({ roomID }) => {
    socket.join(roomID);
    console.log(`[Server] ${socket.id} joined room ${roomID}`);

    socket.to(roomID).emit('ready-for-offer', { socketID: socket.id });
  });
  

  socket.on("offer", ({ roomID, sdp, to }) => {
  console.log("🔗 Server got OFFER for room", roomID);
  
  if (to) {
    // 🔥 Send offer directly to one user (for "to" specific socket)
    io.to(to).emit("offer", { sdp, from: socket.id });
  } else {
    // 🌍 If "to" is not specified, send offer to entire room (broadcast style)
    socket.to(roomID).emit("offer", { sdp, from: socket.id });
  }
});

  socket.on("answer", data => {
    console.log("🔗 Server got ANSWER for room", data.roomID);
    socket.to(data.roomID).emit("answer", data);
  });
  socket.on("ice-candidate", data => {
    console.log("🔗 Server got ICE for room", data.roomID, data.candidate);
    socket.to(data.roomID).emit("ice-candidate", data);
  });
  

  socket.on("disconnect", reason => {
    console.log(`❌ Socket disconnected: ${socket.id} (${reason})`);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
