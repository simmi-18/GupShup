import React from "react";
import { LogOut, Users } from "lucide-react";

const ChatHeader = ({ roomData, onlineUsers, onLeave }) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        {/* Left Side (Logo + Room Info) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Logo */}
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full shadow-lg animate-pulse text-sm sm:text-base">
            💬
          </div>

          {/* Title + Online Users */}
          <div>
            <h1 className="font-bold text-base sm:text-lg md:text-xl text-gray-800 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate max-w-[180px] sm:max-w-[250px] md:max-w-xs">
              Gupshup • {roomData?.username}
            </h1>

            {/* Online Users */}
            <div className="text-xs sm:text-sm text-gray-600 flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              {onlineUsers
                .filter((user) => user.username !== roomData.username)
                .map((user, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] sm:text-xs"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        user.online ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></span>
                    {user.username}
                    <span className="text-[9px] sm:text-[11px] text-gray-500">
                      {user.online ? "Online" : "Offline"}
                    </span>
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* Leave Button */}
        <button
          onClick={onLeave}
          className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border rounded-md text-xs sm:text-sm hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="inline">Leave Room</span>
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
