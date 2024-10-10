import React, { useContext, useEffect, useState } from "react";
import Banner from "../assets/banner.png";
import Background from "../assets/bg-repeat.png";
import { useNavigate } from "react-router-dom";
import { themeContext } from "../context/themeContext.jsx";

export default function LobbyPage({ socket }) {
  const { currentTheme, theme } = useContext(themeContext);
  const [players, setPlayers] = useState({});
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();

  // Ketika komponen dimount, kita mendengarkan data pemain dari server
  useEffect(() => {
    socket.connect();
    // Mendengarkan data pemain dari server
    socket.on("updatePlayers", playersData => {
      setPlayers(playersData);
      localStorage.setItem("username", playersData[socket.id].name);
      localStorage.setItem("userScore", playersData[socket.id].score);
      localStorage.setItem("userAvatar", playersData[socket.id].avatar);

      console.log("Pemain yang diterima dari server: ", playersData);
    });

    // Mendengarkan event untuk memulai game
    socket.on("startGame", () => {
      setIsPlaying(true);
      setTimeout(() => {
        navigate("/game"); // Navigate after 2 seconds
      }, 2000); // 2000 milliseconds = 2 seconds
    });

    return () => {
      socket.off("updatePlayers"); // Membersihkan listener ketika komponen di-unmount
      socket.off("startGame");
    };
  }, [socket, navigate]);

  // Handle player readiness
  const handleReady = () => {
    // Menentukan ID pemain yang bersangkutan
    const playerId = Object.keys(players).find(id => players[id].id === socket.id); // Ganti sesuai dengan cara mendapatkan playerId

    if (isReady) {
      // Jika pemain menekan tombol Cancel
      const data = {
        action: "cancelReady", // Aksi untuk membatalkan
        payload: {
          playerId: playerId, // ID pemain yang membatalkan
          ready: false, // Menandakan bahwa pemain tidak siap
        },
      };
      console.log(data);

      // Kirim data ke server untuk mengubah status siap pemain
      socket.emit("ready", data);

      setIsReady(false); // Set isReady state kembali menjadi false
    } else {
      // Jika pemain menekan tombol Ready
      const data = {
        action: "ready",
        payload: {
          playerId: playerId, // ID pemain yang sedang menekan tombol
          ready: true, // Menandakan bahwa pemain siap
        },
      };
      console.log(data);

      // Kirim data ke server untuk mengubah status siap pemain
      socket.emit("ready", data);

      setIsReady(true); // Set isReady state menjadi true
    }
  };

  return (
    <div
      className="flex flex-col items-center w-screen h-screen bg-repeat gap-y-5"
      style={{
        backgroundImage: theme[currentTheme].bgImage,
        backgroundColor: theme[currentTheme].bgColor,
      }}
    >
      <div className="flex flex-col items-center gap-y-2 mb-4">
        <img src={Banner} alt="Banner" width={600} className="mt-[50px]" />
        <p className="font-black rounded-xl bg-orange-950 p-2 text-white text-lg md:text-xl text-center">Manifest Your Creativity</p>
      </div>
      <div className="flex flex-col items-center w-[60%] relative pt-4">
        <h1 className="font-bold absolute top-0 bg-[#FFBF1F] border-2 rounded-full px-4 py-2 border-[#431407] text-sm">LOBBY</h1>
        <div className="w-full flex flex-wrap items-center justify-center gap-x-6 gap-y-4 bg-white border-2 border-[#431407] rounded-lg p-8">
          {Object.keys(players).map(playerId => (
            <div className="flex flex-col items-center gap-y-2" key={players[playerId].id}>
              <div className="relative flex items-center justify-center cursor-pointer pb-3">
                <img src={players[playerId].avatar} alt={`Avatar ${players[playerId].name}`} width={80} className="absolute" />
                <div className={`border-4 ${players[playerId].ready ? "border-green-500" : "border-orange-500"} rounded-full w-[90px] h-[90px] mt-5`}></div>
                <p className={`font-bold ${players[playerId].ready ? "bg-green-500" : "bg-orange-500"} rounded-full px-2 py-1 text-white absolute bottom-0 text-sm`}>{players[playerId].name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {isPlaying ? (
        <div className="px-4 py-2 bg-[#FFBF00] font-bold border-[#431407] border-2 rounded-lg flex items-center justify-center">Starting Game ...</div>
      ) : (
        <button
          className={`${
            isReady ? "bg-red-500 hover:bg-red-400 border-red-700 hover:border-red-500" : "bg-green-500 hover:bg-green-400 border-green-700 hover:border-green-500"
          } text-white font-bold py-2 px-4 border-b-4 rounded shadow-md drop-shadow-md`}
          onClick={handleReady}
        >
          {isReady ? <p>Cancel</p> : <p>Ready</p>}
        </button>
      )}
    </div>
  );
}
