import React from "react";
import { FileText, Download } from "lucide-react";

const ChatMessages = ({
  messages,
  username,
  typingUser,
  bottomRef,
  onImageClick,
  onFileClick,
}) => {
  return (
    <main className="flex-1 overflow-y-auto px-3 py-4 space-y-3 sm:space-y-4">
      {messages.map((msg, index) => {
        const isUser = msg.author === username;

        const hasText = !!msg.message?.trim();
        const hasFiles = Array.isArray(msg.file_url) && msg.file_url.length > 0;

        return (
          <div
            key={index}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div className="space-y-1 max-w-[90%] sm:max-w-[75%] text-sm sm:text-base">
              {/* File Content */}
              {hasFiles &&
                msg.file_url.map((file, idx) => {
                  const rawFileName = file?.split("/").pop() || "";
                  const cleanedName = rawFileName
                    .replace(/-\d{10,}-\d+/, "") // removes timestamp-random pattern
                    .replace(/_/g, ""); // optional: remove underscores if needed
                  const fileName = cleanedName;

                  const isExternalUrl = file?.startsWith("http");
                  const fileUrl = isExternalUrl
                    ? file
                    : `${process.env.REACT_APP_API_URL}/gupshup/uploads/${file}`;

                  const isImage =
                    file?.match(/\.(jpeg|jpg|png|gif|webp)$/i) ||
                    file?.includes("gif") ||
                    file?.includes("image");

                  return isImage ? (
                    <img
                      key={idx}
                      src={fileUrl}
                      alt="attachment"
                      className="max-w-full max-h-60 sm:max-w-[260px] rounded-md object-contain cursor-pointer border"
                      onClick={() => onImageClick(fileUrl)}
                    />
                  ) : (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 bg-gray-100 border rounded-md cursor-pointer hover:bg-gray-200 transition"
                      onClick={(e) => {
                        e.preventDefault();
                        onFileClick(fileUrl);
                      }}
                    >
                      <FileText className="text-blue-500 w-5 h-5 flex-shrink-0" />
                      <div className="flex flex-col w-40 sm:w-48">
                        <span className="font-medium text-sm truncate">
                          {fileName}
                        </span>
                        <span className="text-xs text-gray-500">
                          Tap to view
                        </span>
                      </div>
                      <a
                        href={fileUrl}
                        download
                        className="ml-auto text-gray-600 hover:text-gray-900"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  );
                })}

              {/* Message Text (with bubble) */}
              {hasText && (
                <div
                  className={`px-4 py-3 rounded-2xl break-words shadow-sm ${
                    isUser
                      ? "bg-blue-100 text-blue-900"
                      : "bg-white text-gray-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {msg.message}
                  </p>
                  <span className="text-xs text-gray-500 mt-1 block text-right">
                    {msg.time}
                  </span>
                </div>
              )}

              {/* Only timestamp for non-text (image/file-only) */}
              {!hasText && hasFiles && (
                <span className="text-xs text-gray-500 mt-1 block text-right">
                  {msg.time}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Typing Indicator */}
      {typingUser && (
        <p className="text-xs text-gray-500 italic ml-2">
          {typingUser} is typing...
        </p>
      )}

      <div ref={bottomRef} />
    </main>
  );
};

export default ChatMessages;
