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

  const activeUsers = {};

  // Function to disconnect a specific user by their socket ID
  function disconnectUser(socketId) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      console.log(`Disconnecting socket with ID: ${socketId}`);
      socket.disconnect(true); // Force disconnection
    } else {
      console.log(`Socket with ID ${socketId} not found.`);
    }
  }

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Unirse a una sala y almacenar el retrospectiveId en el socket
    socket.on(
      "join-retrospective",
      (retrospectiveId, username, isAdmin = false) => {
        console.log(`User ${username} joined retrospective ${retrospectiveId}`);

        if (isAdmin) {
          console.log(`User ${username} is an admin`);
        }

        // Asociar el retrospectiveId con el socket
        socket.data.retrospectiveId = retrospectiveId;

        // Asegúrate de que la sala exista en la lista de usuarios activos
        if (!activeUsers[retrospectiveId]) {
          activeUsers[retrospectiveId] = [];
        }

        // Agregar al usuario a la lista de usuarios activos para esa retrospectiva
        activeUsers[retrospectiveId].push({ id: socket.id, username, isAdmin });

        // Unir al usuario a la sala
        socket.join(retrospectiveId);

        // Enviar la lista actualizada de usuarios activos en la retrospectiva
        io.to(retrospectiveId).emit(
          "active-users",
          activeUsers[retrospectiveId],
        );
      },
    );

    socket.on("get-active-users", (retrospectiveId) => {
      io.to(retrospectiveId).emit("active-users", activeUsers[retrospectiveId]);
    });

    // Mensajes
    socket.on("message", (retrospectiveId, msg) => {
      console.log(`Message in retrospective ${retrospectiveId}:`, msg);
      socket.to(retrospectiveId).emit("message", msg);
    });

    // Posts
    socket.on("posts", (retrospectiveId, post) => {
      console.log(`Received posts in retrospective ${retrospectiveId}:`, post);
      socket.to(retrospectiveId).emit("posts");
    });

    // Escritura
    socket.on("writing", (retrospectiveId, sectionId) => {
      console.log(
        `User writing in retrospective ${retrospectiveId}, section ${sectionId}`,
      );
      socket.to(retrospectiveId).emit("writing", sectionId);
    });

    socket.on("stop-writing", (retrospectiveId, sectionId) => {
      console.log(
        `User stopped writing in retrospective ${retrospectiveId}, section ${sectionId}`,
      );
      io.to(retrospectiveId).emit("stop-writing", sectionId);
    });

    // Eliminar post
    socket.on("delete-post", (retrospectiveId, sectionId, postId) => {
      console.log(
        `Post deleted in retrospective ${retrospectiveId}, section ${sectionId}, post ${postId}`,
      );
      io.to(retrospectiveId).emit("delete-post", sectionId, postId);
    });

    // Temporizador
    socket.on("timer-state", (retrospectiveId, timerState) => {
      console.log(
        `Timer state in retrospective ${retrospectiveId}:`,
        timerState,
      );
      io.to(retrospectiveId).emit("timer-state", timerState);
    });

    socket.on("reset-timer", (retrospectiveId) => {
      console.log(`Resetting timer in retrospective ${retrospectiveId}`);
      io.to(retrospectiveId).emit("reset-timer");
    });

    // Asignar nuevo administrador
    socket.on("assign-new-admin", (retrospectiveId, newAdminId) => {
      const users = activeUsers[retrospectiveId];
      const oldAdminIndex = users.findIndex((user) => user.isAdmin);
      const newAdminIndex = users.findIndex((user) => user.id === newAdminId);

      if (newAdminIndex !== undefined) {
        users[newAdminIndex].isAdmin = true;
        console.log(`User ${users[newAdminIndex].username} is now the admin.`);

        // Quitar el estado de administrador del usuario anterior
        users[oldAdminIndex].isAdmin = false;
        console.log(
          `User ${users[oldAdminIndex].username} is no longer the admin.`,
        );

        io.to(retrospectiveId).emit("assign-new-admin", newAdminId, users);

        // Emitir la lista actualizada de usuarios activos en la retrospectiva
        io.to(retrospectiveId).emit("active-users", users);
      }
    });

    // Desconectar un usuario manualmente
    socket.on("disconnect-user", (retrospectiveId, userId) => {
      disconnectUser(userId);
      const users = activeUsers[retrospectiveId];
      const userIndex = users.findIndex((user) => user.id === userId);

      if (userIndex !== -1) {
        const [removedUser] = users.splice(userIndex, 1);
        console.log(
          `User ${removedUser.username} disconnected from retrospective ${retrospectiveId}`,
        );

        io.to(retrospectiveId).emit("active-users", users);
      }
    });

    // Desconexión
    socket.on("disconnect", () => {
      const retrospectiveId = socket.data.retrospectiveId;

      if (retrospectiveId && activeUsers[retrospectiveId]) {
        const users = activeUsers[retrospectiveId];
        const userIndex = users.findIndex((user) => user.id === socket.id);

        if (userIndex !== -1) {
          // Remove the user from the active users list
          const [removedUser] = users.splice(userIndex, 1);
          console.log(
            `User ${removedUser.username} disconnected from retrospective ${retrospectiveId}`,
          );

          // Check if the removed user was an admin
          if (removedUser.isAdmin) {
            console.log(
              `Admin ${removedUser.username} disconnected. Reassigning admin...`,
            );

            // Promote another user to admin, if any users are left
            if (users.length > 0) {
              users[0].isAdmin = true; // Promote the first user in the list
              console.log(`User ${users[0].username} is now the admin.`);

              io.to(retrospectiveId).emit("assign-new-admin", users[0].id);
            } else {
              // Remove the retrospective from the list of active retrospectives
              delete activeUsers[retrospectiveId];
              console.log("No users left in the retrospective.");
            }
          }

          // Emit the updated list of active users in the retrospective
          io.to(retrospectiveId).emit("active-users", users);
        }
      }
    });
  });

  const PORT = process.env.PORT || 3002;

  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
