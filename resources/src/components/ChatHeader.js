import React, { useState } from "react";
import { LogOut, Users, QrCode } from "lucide-react";
import MyQRCodeModal from "./MyQRCodeModal";

const ChatHeader = ({ roomData, onlineUsers, onLeave }) => {
  const [showMyQR, setShowMyQR] = useState(false);

  // Filter out current user
  const otherUsers = onlineUsers.filter(
    (user) => user.username !== roomData?.username
  );

  return (
    <>
      {/* Header Bar */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          {/* Left Side */}
          <div className="flex items-center gap-3">
            {/* Your profile image */}
            {roomData?.profileImage ? (
              <div
                className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white shadow-md overflow-hidden"
                title={`${roomData.username} (You)`}
              >
                <img
                  src={`${process.env.REACT_APP_API_URL}/gupshup/uploads/${roomData.profileImage}`}
                  alt={roomData.username}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white bg-green-500"></span>
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-md">
                💬
              </div>
            )}

            {/* Room title and other users */}
            <div>
              <h1 className="font-bold text-base sm:text-lg md:text-xl text-gray-800 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate max-w-[180px] sm:max-w-[250px] md:max-w-xs">
                Chatify • {roomData?.username}
              </h1>

              {/* Online users info */}
              <div className="text-xs sm:text-sm text-gray-600 flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                {otherUsers.length > 0 ? (
                  otherUsers.map((user, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
                    >
                      {/* Profile Image */}
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                        {user.profileImage ? (
                          <img
                            src={`${process.env.REACT_APP_API_URL}/gupshup/uploads/${user.profileImage}`}
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white text-[10px]">
                            💬
                          </div>
                        )}
                      </div>

                      {/* Username & Status */}
                      <span className="flex items-center gap-1">
                        <span className="font-medium">{user.username}</span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            user.online ? "bg-green-500" : "bg-gray-400"
                          }`}
                        ></span>
                        <span className="text-[9px] text-gray-500">
                          {user.online ? "Online" : "Offline"}
                        </span>
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400 text-xs">No other users</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center gap-2">
            {/* My QR Button */}
            <button
              onClick={() => setShowMyQR(true)}
              className="flex items-center justify-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border rounded-md text-xs sm:text-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Leave Button */}
            <button
              onClick={onLeave}
              className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border rounded-md text-xs sm:text-sm hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Leave Room</span>
            </button>
          </div>
        </div>
      </header>

      {/* QR Modal */}
      {showMyQR && (
        <MyQRCodeModal
          room={roomData?.room}
          onClose={() => setShowMyQR(false)}
        />
      )}
    </>
  );
};

export default ChatHeader;
