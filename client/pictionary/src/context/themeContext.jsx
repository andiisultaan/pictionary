import { createContext, useState } from "react";
import MaleBackground from "../assets/bg-repeat.png"; // Background image
import FemaleBackground from "../assets/bg-repeat-1.png"; // Background image
import Avatar from "../assets/avatars/0.png"; // Default avatar
import Avatar2 from "../assets/avatars/1.png"; // Default avatar

export const themeContext = createContext({
  currentTheme: "",
  setCurrentTheme: () => {},
  theme: {
    male: {
      // bgImage: ``, // Set background image
      bgColor: "",
      // userAvatar: "",
    },
    female: {
      // bgImage: ``, // Set background image
      bgColor: "",
      // userAvatar: "",
    },
  },
});

export default function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState("male");

  return (
    <themeContext.Provider
      value={{
        currentTheme,
        setCurrentTheme,
        theme: {
          male: {
            bgImage: `url(${MaleBackground})`, // Set background image
            bgColor: "#09a3fa",
            userAvatar: Avatar,
          },
          female: {
            bgImage: `url(${FemaleBackground})`, // Set background image
            bgColor: "#ff6bf9",
            userAvatar: Avatar2,
          },
        },
      }}
    >
      {children}
    </themeContext.Provider>
  );
}
