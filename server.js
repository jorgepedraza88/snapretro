// server.js o server.ts
import next from "next";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new SocketIOServer(server);

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("message", (msg) => {
      console.log("Received message:", msg);
      socket.broadcast.emit("message", msg);
    });

    socket.on("posts", (posts) => {
      console.log("Received post", posts);
      socket.broadcast.emit("posts");
    });

    socket.on("writing", (sectionId) => {
      console.log("Someone is writing in:", sectionId);
      socket.broadcast.emit("writing", sectionId);
    });

    socket.on("stop-writing", (sectionId) => {
      console.log("Someone stopped writing in:", sectionId);
      socket.broadcast.emit("stop-writing", sectionId);
    });

    socket.on("delete-post", (sectionId, postId) => {
      console.log("Someone deleted post:", postId);
      socket.broadcast.emit("delete-post", sectionId, postId);
    });

    socket.on("timer-state", (timerState) => {
      console.log("timer state", timerState);
      socket.broadcast.emit("timer-state", timerState);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });

  const PORT = process.env.PORT || 3002;

  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
