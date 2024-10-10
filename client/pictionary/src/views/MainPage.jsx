import React, { useContext, useEffect, useState } from "react";
import Avatar from "../assets/avatars/0.png"; // Default avatar
import Avatar2 from "../assets/avatars/1.png"; // Default avatar
import Banner from "../assets/banner.png"; // Banner image
import { Avatars } from "../lib/utils"; // Ensure the correct path for Avatars
import { useNavigate } from "react-router-dom";
import { themeContext } from "../context/themeContext.jsx";

export default function MainPage({ socket }) {
  const { currentTheme, theme, setCurrentTheme } = useContext(themeContext);
  const navigate = useNavigate();
  const [viewAvatars, setViewAvatars] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(0); // Avatar index
  const [username, setUsername] = useState(""); // Username state
  const [players, setPlayers] = useState({}); // Players state
  const [join, setJoin] = useState(false); // State to check if the user has joined

  useEffect(() => {
    // Connect to the server when the component mounts
    socket.connect();
    // Listen for server responses for updating the player list
    socket.on("join", data => {
      setPlayers(data.payload.players);
    });

    // Get the player's unique ID from the server
    socket.on("get_id", data => {
      console.log("Player ID:", data.payload.id);
    });

    return () => {
      // Clean up listeners on unmount
      socket.off("join");
      socket.off("get_id");
    };
  }, [socket]);

  const handleJoin = () => {
    if (username.length > 0) {
      const data = {
        action: "join",
        payload: {
          name: username,
          avatar: theme[currentTheme].userAvatar, // Use the selected avatar
        },
      };

      console.log("Joining with data:", data);

      // Send the join event to the server
      socket.emit("join", data);
      setJoin(true); // Indicate the user has joined

      navigate("/lobby");
    }
  };

  return (
    <div
      className="flex flex-col items-center w-screen h-screen bg-repeat gap-y-5"
      style={{
        backgroundImage: theme[currentTheme]?.bgImage, // Set background image
        backgroundColor: theme[currentTheme]?.bgColor,
      }}
    >
      {/* Gender Selection */}
      <div className="flex flex-col items-center mt-5">
        <p className="text-gray-700 mb-2 bg-yellow-200 px-3 py-1 rounded-md">Select Gender</p>
        <button className={`relative inline-flex items-center h-6 rounded-full w-12 focus:outline-none bg-white`} onClick={() => setCurrentTheme(currentTheme === "male" ? "female" : "male")}>
          <span className={`inline-block w-6 h-6 transform rounded-full bg-gray-500 transition-transform duration-200 ease-in-out ${currentTheme === "male" ? "translate-x-0" : "translate-x-6"}`} />
        </button>
      </div>

      {/* Banner Section */}
      <div className="flex flex-col items-center gap-y-2 mb-4">
        <img src={Banner} alt="" className="w-full max-w-md mt-8" />
        <p className="font-black rounded-xl bg-orange-950 p-2 text-white text-lg md:text-xl text-center">Manifest Your Creativity</p>
      </div>

      {/* Join Room Section */}
      <div className="flex flex-col items-center p-6 relative pt-4">
        <h1 className="font-bold absolute top-0 bg-[#FFBF1F] border-2 rounded-full px-4 py-2 border-[#431407] text-sm">QUICK PLAY</h1>
        <div className="flex flex-col items-center gap-y-4 bg-white border-2 border-[#431407] rounded-lg p-8 w-full max-w-xs">
          <div className="relative flex items-center justify-center pb-3 cursor-pointer" onClick={() => setViewAvatars(true)}>
            <img src={theme[currentTheme].userAvatar} alt="avatar" className="absolute" />
            <div className={`border-4 border-orange-500 rounded-full w-[110px] h-[110px] mt-5`}></div>
            <p className="font-bold bg-orange-500 rounded-full px-2 py-1 text-white absolute bottom-0 text-sm">Let's Play!</p>
          </div>
          <input maxLength="10" className="w-full max-w-xs p-2 text-center border-2 rounded-lg" type="text" value={username} placeholder="Enter your nickname" onChange={e => setUsername(e.target.value)} />
          <button
            onClick={handleJoin}
            className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-4 border-b-4 border-orange-700 hover:border-orange-500 rounded w-full shadow-md"
            disabled={username.length === 0} // Disable button if username is empty
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}
