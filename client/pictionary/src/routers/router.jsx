import { createBrowserRouter, redirect } from "react-router-dom";
import MainPage from "../views/MainPage";
import AvatarPage from "../views/AvatarPage";
import FinalPage from "../views/FinalPage";
import GamePage from "../views/GamePage";
import LobbyPage from "../views/LobbyPage";

import { io } from "socket.io-client";
const socket = io("34.143.228.90", {
  autoConnect: false,
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage socket={socket} />,
  },
  {
    path: "/avatar",
    element: <AvatarPage />,
  },
  {
    path: "/final",
    element: <FinalPage />,
  },
  {
    path: "/game",
    element: <GamePage socket={socket} />,
  },
  {
    path: "/lobby",
    element: <LobbyPage socket={socket} />,
  },
]);

export default router;
