const express = require("express");
const app = express();
const { createServer } = require("node:http");
const { v4: uuidv4 } = require("uuid");
const { Server } = require("socket.io");

const PORT = 80;
let players = {};
let drawerIndex = 0;
let gotCorrect = 0;
let rounds = 0;
let status = "waiting";

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://pictionary-two.vercel.app/"], // Ganti dengan port front-end Anda jika perlu
  },
});

io.on("connection", socket => {
  const id = uuidv4();
  console.log("A client has connected:", socket.id);

  // Event join
  socket.on("join", data => {
    players[socket.id] = {
      id: socket.id,
      name: data.payload.name,
      avatar: data.payload.avatar,
      ready: false,
      score: 0,
      correct: false,
    };
    // console.log(players);

    // Broadcast pemain yang sudah bergabung kepada semua klien
    io.emit("updatePlayers", players);

    if (status === "playing") {
      socket.emit("startGame", { players: players });
      socket.emit("next", {
        players: players,
        drawer: players[Object.keys(players)[drawerIndex]],
      });
    }
  });

  // Event player ready
  socket.on("ready", data => {
    const { action, payload } = data;

    if (action === "ready") {
      if (players[payload.playerId]) {
        players[payload.playerId].ready = true;
        // console.log(`Player ${payload.playerId} is ready`);

        // Emit update ke semua klien
        io.emit("updatePlayers", players);

        if (allPlayersReady()) {
          io.emit("startGame", { players: players });
          io.emit("next", {
            players: players,
            drawer: players[Object.keys(players)[drawerIndex]],
          });
          status = "playing";
        }
      }
    } else if (action === "cancelReady") {
      if (players[payload.playerId]) {
        players[payload.playerId].ready = false;
        // console.log(`Player ${payload.playerId} canceled readiness`);

        io.emit("updatePlayers", players);
      }
    }
  });

  // Event untuk putaran permainan berikutnya
  socket.on("next", () => {
    gotCorrect = 0;
    rounds += 1;

    if (rounds === Object.keys(players).length) {
      players = Object.fromEntries(Object.entries(players).sort((a, b) => b[1].score - a[1].score));
      io.emit("end", { players: players });
      status = "waiting";
      rounds = 0;
      return;
    }

    for (const player of Object.values(players)) {
      player.correct = false;
    }

    drawerIndex = (drawerIndex + 1) % Object.keys(players).length;
    io.emit("next", {
      players: players,
      drawer: players[Object.keys(players)[drawerIndex]],
    });
  });

  // Event untuk mengatur kata yang akan ditebak
  socket.on("word:chosen", word => {
    for (const playerId in players) {
      players[playerId].correct = false; // Reset correct status untuk pemain ini
    }

    io.emit("word:update", word);
    io.emit("updatePlayers", players);
  });

  socket.on("message:new", ({ answer, currentWord }) => {
    const player = players[socket.id];
    // console.log("Current players:", players);
    // console.log(answer, "ini anserw");
    // console.log(currentWord, "ini crr");

    if (player) {
      // let correct = false;
      if (answer === currentWord) {
        // correct = true;
        player.correct = true;
        player.score += 20;

        io.emit("scoreUpdate", players);

        if (player.score >= 100) {
          io.emit("gameOver", { winner: player });
          resetGame();
          return;
        }
      }

      io.emit("message:update", {
        username: player.name,
        score: player.score,
        avatar: player.avatar,
        message: answer,
        correct: player.correct,
      });
    } else {
      console.log(`Player not found for socket id: ${socket.id}`);
    }
  });

  socket.on("drawing:data", data => {
    // Mengirim data gambar ke semua klien (termasuk pengirim)
    io.emit("drawing:receive", data);
  });

  // Mendengarkan event clear dan menyebarkannya ke semua klien
  socket.on("drawing:clear", () => {
    io.emit("drawing:clear");
  });

  // Mendengarkan perubahan timer dari klien
  socket.on("timer:update", newSeconds => {
    // Kirim update ke semua klien yang terhubung
    io.emit("timer:update", newSeconds);
  });

  // Event ketika pemain disconnect
  socket.on("disconnect", () => {
    console.log("A client has disconnected:", socket.id);
    removePlayer(socket, socket.id);
  });
});

// Fungsi untuk memeriksa apakah semua pemain sudah siap
function allPlayersReady() {
  return Object.values(players).every(player => player.ready);
}

// Fungsi untuk menghapus pemain saat mereka disconnect
function removePlayer(socket, id) {
  const player_left = players[id];
  delete players[id];
  io.emit("leave", { players: players, player_left: player_left });

  if (allPlayersReady()) {
    io.emit("start", { players: players });
  }
}

// Fungsi untuk reset game setelah pemain mencapai skor maksimal
function resetGame() {
  status = "waiting"; // Mengembalikan status ke 'waiting'
  rounds = 0;
  drawerIndex = 0;

  // Reset skor dan status correct semua pemain
  Object.values(players).forEach(player => {
    player.correct = false;
    player.score = 0; // Reset skor jika diperlukan
    player.ready = false; // Reset status siap
  });

  // Emit updatePlayers ke semua klien untuk memperbarui status pemain
  io.emit("updatePlayers", players);
}

// Memulai server pada port yang ditentukan
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
