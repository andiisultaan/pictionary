import { useLocation, useNavigate } from "react-router-dom";
import Banner from "../assets/banner.png";
import { themeContext } from "../context/themeContext.jsx";
import { useContext } from "react";

export default function FinalPage() {
  const { theme, currentTheme } = useContext(themeContext);
  const location = useLocation();
  const navigate = useNavigate();
  const winner = location.state?.winner || { name: "Anonymous", score: 0 };

  return (
    <>
      <div
        className="flex flex-col items-center h-screen"
        style={{
          backgroundImage: theme[currentTheme]?.bgImage, // Set background image
          backgroundColor: theme[currentTheme]?.bgColor,
        }}
      >
        <div className="flex flex-col items-center gap-y-2 mb-4">
          <img src={Banner} alt="banner" width={600} className="mt-[50px]" />
          <p className="font-black rounded-xl bg-orange-950 p-2 text-white text-xl">Manifest Your Creativity</p>
        </div>
        <div className="flex flex-col items-center p-6 relative pt-4 w-[50%]">
          <h1 className="font-bold absolute top-0 bg-[#FFBF1F] border-2 rounded-full px-4 py-2 border-[#431407] text-sm">FINAL SCORE</h1>
          <div className="bg-white rounded-lg w-full min-h-[350px] flex flex-col items-center border-2 border-[#431407]">
            <div className="bg-white border rounded-lg w-full h-full flex flex-col items-center gap-y-4 p-6">
              <p className="font-bold text-green-500 mt-6 text-xl">{winner.name} won!</p>

              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-x-3">
                  <img src={winner.avatar} alt="avatar" width={35} />
                  <div className="flex flex-col">
                    {/* Menampilkan nama pemenang */}
                    <p className="font-bold">{winner.name}</p>
                    {/* Menampilkan skor pemenang */}
                    <p className="text-sm text-slate-500">{winner.score} points</p>
                  </div>
                </div>
              </div>

              {/* Tombol untuk kembali ke halaman awal */}
              <button className="mt-4 px-6 py-2 bg-orange-500 text-white font-bold rounded-lg" onClick={() => navigate("/")}>
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
