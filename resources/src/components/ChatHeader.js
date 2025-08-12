import React from "react";
import { LogOut, Users } from "lucide-react";

const ChatHeader = ({ roomData, onlineUsers, onLeave }) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full shadow-lg animate-pulse">
            💬
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-800 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Gupshup • {roomData?.username}
            </h1>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {onlineUsers
                .filter((user) => user.username !== roomData.username)
                .map((user, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        user.online ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></span>
                    <span>{user.username}</span>
                    <span className="text-xs text-gray-500">
                      {user.online ? "Online" : "Offline"}
                    </span>
                  </li>
                ))}
            </p>
          </div>
        </div>
        <button
          onClick={onLeave}
          className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Leave Room
        </button>
      </div>
    </header>
  );
};
export default ChatHeader;
