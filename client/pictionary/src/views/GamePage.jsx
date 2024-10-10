import React, { useContext, useState, useEffect } from "react";
import Chat from "../components/Chat";
import DrawingBoard from "../components/DrawingBoard";
import Players from "../components/Players";
import RevealWord from "../components/RevealWord";

import Banner from "../assets/banner.png";
import { themeContext } from "../context/themeContext.jsx";

export default function GamePage({ socket }) {
  const { currentTheme, theme } = useContext(themeContext);
  const [seconds, setSeconds] = useState(35);
  const [currentWord, setCurrentWord] = useState("");
  const [previousWord, setPreviousWord] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [players, setPlayers] = useState({});
  const [isWordRevealed, setIsWordRevealed] = useState(false);

  const words = [
    "apple",
    "house",
    "sun",
    "flower",
    "car",
    "boat",
    "plane",
    "dog",
    "cat",
    "heart",
    "figure",
    "cake",
    "balloon",
    "ball",
    "cloud",
    "star",
    "rainbow",
    "book",
    "chair",
    "table",
    "ladder",
    "skateboard",
    "bicycle",
    "bird",
    "fish",
    "moon",
    "key",
    "crown",
    "hat",
    "glasses",
    "sock",
    "shirt",
    "pants",
    "shoe",
    "glove",
    "backpack",
    "basket",
    "gift",
    "box",
    "bag",
    "envelope",
    "clock",
    "watch",
    "phone",
    "camera",
  ];

  useEffect(() => {
    const initialWord = words[wordIndex];
    setCurrentWord(initialWord);
    setPreviousWord(initialWord);
    socket.emit("word:chosen", initialWord);
  }, [wordIndex, socket]);

  useEffect(() => {
    socket.on("updatePlayers", playersData => {
      setPlayers(playersData);
    });

    return () => {
      socket.off("updatePlayers");
      socket.off("message:update");
    };
  }, [socket]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isWordRevealed && seconds > 0) {
        setSeconds(prev => prev - 1);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [seconds, isWordRevealed]);

  useEffect(() => {
    if (seconds === 0) {
      setIsWordRevealed(true);
      setCurrentWord(previousWord);
      socket.emit("word:chosen", previousWord);

      setTimeout(() => {
        setIsWordRevealed(false);
        setSeconds(35);
        setWordIndex(prevIndex => (prevIndex + 1) % words.length);
      }, 6000);
    }
  }, [seconds, previousWord, socket]);

  useEffect(() => {
    socket.emit("players", players);
  }, [players, socket]);

  // Function to close the modal
  const closeModal = () => {
    setIsWordRevealed(false);
  };

  return (
    <>
      <div
        className="flex flex-col lg:flex-row items-center lg:items-start justify-between"
        style={{
          backgroundImage: theme[currentTheme]?.bgImage,
          backgroundColor: theme[currentTheme]?.bgColor,
        }}
      >
        <Players socket={socket} players={players} />
        <div className="flex flex-col items-center gap-y-2 w-full lg:w-[440px] h-full p-4">
          <div className="flex flex-col items-center gap-y-2 mb-8">
            <img src={Banner} alt="" className="w-[200px] md:w-[300px]" />
            <p className="font-black rounded-xl bg-orange-950 p-2 text-white text-lg md:text-xl text-center">Manifest Your Creativity</p>
          </div>
          <div className="flex flex-col md:flex-row">
            <div className="mt-4 md:mt-0">
              <DrawingBoard socket={socket} seconds={seconds} setSeconds={setSeconds} players={players} isWordRevealed={isWordRevealed} />
            </div>
          </div>
          {isWordRevealed && <RevealWord word={previousWord} onClose={closeModal} />}
        </div>
        <Chat socket={socket} players={players} />
      </div>
    </>
  );
}
