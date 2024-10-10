import React, { useState, useEffect } from "react";

const RevealWord = ({ word, onClose }) => {
  const [progress, setProgress] = useState(0);
  const revealWordTimer = 5; // Duration for the progress timer in seconds

  useEffect(() => {
    let timer;

    const runTimer = () => {
      timer = setInterval(() => {
        setProgress(prevProgress => {
          if (prevProgress >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prevProgress + 100 / (revealWordTimer * 10); // Increment progress
        });
      }, 100);
    };

    runTimer();

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[300px] md:w-[400px] p-6 flex flex-col items-center justify-center border-2 border-[#043173]">
        <p className="text-slate-500 text-sm">Kata yang Benar:</p>
        <h1 className="font-bold text-blue-500 mb-4 text-2xl">{word.toUpperCase()}</h1>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <button onClick={onClose} className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
          Tutup
        </button>
      </div>
    </div>
  );
};

export default RevealWord;
