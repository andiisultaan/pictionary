import React, { useEffect, useRef, useState } from "react";
import Timer from "../components/Timer";

export default function DrawingBoard({ socket, seconds, setSeconds }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const isDrawing = useRef(false);
  const [currentWord, setCurrentWord] = useState("");
  const [drawer, setDrawer] = useState(null); // Menyimpan informasi drawer
  const [players, setPlayers] = useState({});

  // Total waktu (dalam detik) untuk timer
  const totalSeconds = 35; // Anda dapat mengubah nilai ini sesuai kebutuhan

  // Mengirim data koordinat melalui socket.io
  const sendDrawingData = (action, x, y) => {
    socket.emit("drawing:data", { action, x, y });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.strokeStyle = "black"; // ubah warna
    context.lineWidth = 2; // ketebalan garis
    contextRef.current = context;

    // Set auth dan connect ke socket
    socket.auth = {
      username: localStorage.getItem("username"),
      score: localStorage.getItem("userScore"),
      avatar: localStorage.getItem("useravatar"),
    };
    socket.connect();

    // Mendengarkan kata yang dipilih dari server
    socket.on("word:update", word => {
      setCurrentWord(word);
    });

    socket.on("updatePlayers", updatedPlayers => {
      setPlayers(updatedPlayers);
    });

    // Mendengarkan data gambar dari server
    socket.on("drawing:receive", data => {
      const context = contextRef.current;
      if (data.action === "start") {
        context.beginPath();
        context.moveTo(data.x, data.y);
      } else if (data.action === "draw") {
        context.lineTo(data.x, data.y);
        context.stroke();
      } else if (data.action === "stop") {
        context.closePath();
      }
    });

    // Mendengarkan event clear dari server untuk membersihkan canvas
    socket.on("drawing:clear", () => {
      handleClearCanvas();
    });

    // Mendengarkan event "next" untuk mendapatkan informasi drawer
    socket.on("next", ({ drawer }) => {
      setDrawer(drawer); // Update state drawer
    });

    // Cleanup saat komponen di-unmount
    return () => {
      socket.off("word:update");
      socket.off("drawing:receive");
      socket.off("drawing:clear");
      socket.off("next"); // Pastikan untuk menghapus listener ini
      socket.disconnect();
    };
  }, [socket]);

  // Fungsi untuk membersihkan canvas
  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height); // Membersihkan seluruh canvas
  };

  // Fungsi untuk mengirimkan event clear melalui socket.io
  const handleClearCanvasClick = () => {
    handleClearCanvas(); // Bersihkan canvas pada klien sendiri
    socket.emit("drawing:clear"); // Kirim event clear ke server untuk disebarkan ke semua klien
  };

  // Fungsi untuk menangani mouse down (mulai menggambar)
  const handleMouseDown = e => {
    isDrawing.current = true;
    const coords = getMouseCoords(canvasRef.current, e);
    const context = contextRef.current;
    context.beginPath();
    context.moveTo(coords.x, coords.y);

    sendDrawingData("start", coords.x, coords.y);
  };

  // Fungsi untuk menangani mouse move (saat menggambar)
  const handleMouseMove = e => {
    if (!isDrawing.current) return;
    const coords = getMouseCoords(canvasRef.current, e);
    const context = contextRef.current;
    context.lineTo(coords.x, coords.y);
    context.stroke();

    sendDrawingData("draw", coords.x, coords.y);
  };

  // Fungsi untuk menangani mouse up (selesai menggambar)
  const handleMouseUp = () => {
    isDrawing.current = false;
    const context = contextRef.current;
    context.closePath();

    sendDrawingData("stop", 0, 0); // Kirim aksi berhenti
  };

  // Mendapatkan koordinat mouse
  const getMouseCoords = (canvas, e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // skala X
    const scaleY = canvas.height / rect.height; // skala Y
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Event listener untuk mouse events
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Fungsi untuk memeriksa apakah pemain saat ini adalah drawer
  const isCurrentPlayerDrawer = () => {
    const currentPlayerId = localStorage.getItem("username"); // Ganti ini dengan cara Anda mendapatkan ID pemain saat ini
    return drawer && drawer.name === currentPlayerId; // Cek apakah ID pemain saat ini sama dengan ID drawer
  };

  return (
    <>
      <div className="flex flex-col items-center relative pt-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="flex justify-center relative">
            {" "}
            {/* Set relative positioning for the canvas container */}
            <p className="absolute top-10 text-sm md:text-base">{!isCurrentPlayerDrawer() ? "" : currentWord && currentWord.toUpperCase()}</p>
            {drawer?.id && <h1 className="font-bold absolute top-0 bg-[#FFBF1F] border-2 rounded-full px-4 py-1 border-[#431407] text-xs">{!isCurrentPlayerDrawer() ? "GUESS THE WORD" : "YOU ARE THE DRAWER"}</h1>}
            <canvas
              id="gameCanvas"
              width={700} // Set the internal size of the canvas
              height={700} // Set the internal size of the canvas
              ref={canvasRef}
              className={`bg-white rounded-lg border-2 border-[#431407] md:w-[600px] md:h-[600px] ${!isCurrentPlayerDrawer() ? "pointer-events-none" : ""}`} // Adjust size for larger canvas
              style={{ width: "100%", height: "100%" }} // Responsive size
            ></canvas>
            {/* Timer positioned inside the canvas */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center">
              <Timer socket={socket} seconds={seconds} setSeconds={setSeconds} totalSeconds={totalSeconds} />
            </div>
          </div>
        </div>

        {/* Clear button below the canvas */}
        <div className="flex flex-col items-center mt-2">
          <div className="flex justify-center drop-shadow-xl">
            <button
              onClick={handleClearCanvasClick}
              className={`ml-1 mt-1 border border-black bg-white text-black px-4 py-2 rounded-lg ${!isCurrentPlayerDrawer() ? "opacity-50 cursor-not-allowed" : ""}`} // Disable button if not drawer
              disabled={!isCurrentPlayerDrawer()} // Disable button if not drawer
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
