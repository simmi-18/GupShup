import React, { useContext, useEffect, useState } from "react";
import { Users, ArrowRight, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { joinRoom } from "./services";
import { SocketContext } from "./context/SocketContext";
import { v4 as uuidv4 } from "uuid";
import QRScannerModal from "./components/QRScannerModal";

const JoinRoom = () => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);

  const navigate = useNavigate();
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (!socket) return;
    console.log("📡 Frontend Socket connected:", socket.id);
    return () => {
      console.log("❌ Frontend Socket disconnected:", socket.id);
    };
  }, [socket]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket Connected:", socket.connected);
    });

    socket.on("connect_error", (err) => {
      console.error("Connection Error:", err.message);
    });

    socket.on("disconnect", () => {
      console.warn("⚠️ Disconnected from socket");
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
    };
  }, []);

  const generateRoomId = () => {
    const newRoomId = uuidv4();
    setRoom(newRoomId);
  };

  const handleScan = (data) => {
    if (data && !scanned) {
      setScanned(true);
      try {
        const parsed = JSON.parse(data.text || data);
        if (parsed.room) {
          setRoom(parsed.room);
          alert(`✅ Room scanned successfully! Room ID: ${parsed.room}`);
          setTimeout(() => {
            handleJoin({ preventDefault: () => {} });
          }, 800);
        } else {
          alert("⚠️ Invalid QR code data");
        }
      } catch (error) {
        alert("⚠️ Could not read QR code");
      }
    }
  };

  const handleError = (err) => {
    console.error("QR Scanner Error:", err);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !room.trim()) return;
    try {
      const res = await joinRoom({ username, room });
      console.log("Joining room:", res);
      localStorage.setItem("username", username);
      localStorage.setItem("room", room);

      socket.emit("join_room", { room, username });
      console.log("Socket emitted");

      navigate("/chat");
      console.log("Navigating to /chat...");
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 lg:p-16">
      {/* Header / Logo */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full mb-4 shadow-lg animate-pulse">
          <span className="text-2xl sm:text-3xl md:text-4xl">💬</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Gupshup
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base md:text-lg">
          Connect and chat with people around the world
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleJoin}
        className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-white/80 backdrop-blur-sm rounded-xl shadow-xl px-6 sm:px-8 py-8 sm:py-10 space-y-6"
      >
        <div className="text-center space-y-1 sm:space-y-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Join a Room
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Enter details or scan QR to join instantly
          </p>
        </div>

        <div className="space-y-4">
          {/* Name Field */}
          <div className="space-y-1 sm:space-y-2">
            <label
              htmlFor="username"
              className="text-sm sm:text-base font-medium text-gray-700 flex items-center gap-2"
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              Your Name
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-10 sm:h-12 px-3 sm:px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>

          {/* Room ID Field */}
          <div className="space-y-1 sm:space-y-2">
            <label
              htmlFor="room"
              className="text-sm sm:text-base font-medium text-gray-700 flex items-center gap-2"
            >
              <span className="text-base sm:text-lg">💬</span>
              Room ID
              <QrCode
                onClick={() => setShowScanner(true)}
                className="text-gray-600 hover:text-blue-600 cursor-pointer ml-2"
                size={18}
                title="Scan QR Code to Join Room"
              />
            </label>
            <input
              id="room"
              type="text"
              placeholder="Enter room ID"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full h-10 sm:h-12 px-3 sm:px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={generateRoomId}
          className="text-xs sm:text-sm text-blue-600 underline hover:text-blue-800"
        >
          Generate Room ID
        </button>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!username.trim() || !room.trim()}
          className="w-full h-10 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          Join Room
          <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="text-center pt-2 sm:pt-4">
          <p className="text-xs sm:text-sm text-gray-500">
            Don't have a room ID? Create one with friends!
          </p>
        </div>
      </form>

      {/* Footer */}
      <div className="text-center mt-6 sm:mt-8 text-gray-500 text-xs sm:text-sm">
        <p>Secure • Fast • Reliable</p>
      </div>

      {showScanner && (
        <QRScannerModal
          onError={handleError}
          onClose={() => setShowScanner(false)}
          onResult={handleScan}
        />
      )}
    </div>
  );
};

export default JoinRoom;
