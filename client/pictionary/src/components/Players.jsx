import { useEffect, useState } from "react";
import Pencil from "../assets/pencil.png";
import Avatars from "../assets/avatars/0.png";
import PlayersLabel from "../assets/players.png";
import { useNavigate } from "react-router-dom";

export default function Players({ socket }) {
  const [currentPlayer, setCurrentPlayer] = useState({
    id: "",
    name: "",
    avatar: Avatars,
    score: 0,
  });
  const [players, setPlayers] = useState({});
  const [drawer, setDrawer] = useState(null); // Menyimpan siapa drawer
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem("username") || "Anonymous";
    const userScore = localStorage.getItem("userScore") || 0;
    const userAvatar = localStorage.getItem("userAvatar") || Avatars;

    const playerData = {
      id: socket.id,
      name: username,
      avatar: userAvatar,
      score: parseInt(userScore, 10) || 0,
    };

    setCurrentPlayer(playerData);

    socket.emit("join", { payload: playerData });

    socket.on("updatePlayers", updatedPlayers => {
      setPlayers(updatedPlayers);
    });

    // Mendapatkan drawer dari server
    socket.on("next", ({ drawer }) => {
      setDrawer(drawer);
    });

    socket.on("scoreUpdate", updatedPlayers => {
      setPlayers(updatedPlayers);
    });

    socket.on("gameOver", ({ winner }) => {
      navigate("/final", { state: { winner } });
    });

    return () => {
      socket.off("updatePlayers");
      socket.off("next");
      socket.off("scoreUpdate");
      socket.off("gameOver");
    };
  }, [socket, navigate]);

  return (
    <div className="flex flex-col w-full lg:w-[280px] lg:h-screen md:h-screen">
      <div className="flex flex-col items-center w-full h-full p-4 bg-white gap-y-4 border-[#431407] border-r-2">
        <img src={PlayersLabel} alt="players" width={140} />
        <div className="flex flex-col w-full">
          {Object.values(players).map(player => (
            <div key={player.id} className={`flex items-center justify-between w-full p-2 border-b border-slate-200 ${player.id === drawer?.id ? "bg-yellow-200" : ""}`}>
              <div className="flex items-center gap-x-3">
                <img src={player.avatar} alt="avatar" width={40} />
                <div className="flex flex-col">
                  <p className="font-bold text-slate-700">{player.name}</p>
                  <p className="text-xs text-slate-500">{player.score} points</p>
                </div>
              </div>
              {player.id === drawer?.id && <img src={Pencil} alt="draw-icon" width={25} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
