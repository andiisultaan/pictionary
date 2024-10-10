import React, { useEffect } from "react";

export default function Timer({ socket, seconds, setSeconds, totalSeconds }) {
  useEffect(() => {
    let intervalId;

    // Emit perubahan seconds setiap detik
    if (seconds > 0) {
      intervalId = setInterval(() => {
        setSeconds(prevSeconds => {
          const newSeconds = prevSeconds - 1;
          socket.emit("timer:update", newSeconds); // Emit perubahan waktu ke server
          return newSeconds;
        });
      }, 1000);
    } else {
      clearInterval(intervalId);
    }

    // Mendengarkan perubahan waktu dari server
    socket.on("timer:update", newSeconds => {
      setSeconds(newSeconds); // Update nilai waktu berdasarkan data dari server
    });

    return () => {
      clearInterval(intervalId);
      socket.off("timer:update"); // Cleanup listener saat komponen di-unmount
    };
  }, [seconds, socket, setSeconds]);

  // Menghitung lebar garis berdasarkan waktu tersisa
  const progressWidth = (seconds / totalSeconds) * 100;

  return (
    <div className="flex flex-col items-center mt-3">
      <div className="relative w-full h-2 bg-gray-300 rounded">
        <div style={{ width: `${progressWidth}%` }} className="h-full bg-green-500 rounded"></div>
      </div>
      <p className="mt-1 text-sm">{seconds} seconds left</p>
    </div>
  );
}
