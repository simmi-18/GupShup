import React, { useEffect, useRef, useState } from "react";
import {
  FileText,
  Download,
  MoreVertical,
  Check,
  CheckCheck,
} from "lucide-react";

const ChatMessages = ({
  messages,
  username,
  typingUser,
  bottomRef,
  onImageClick,
  onFileClick,
  onReply,
  onEdit,
  onDelete,
  onCopy,
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderTicks = (msg) => {
    if (!msg.status) return null;
    if (msg.status === "sent")
      return <Check size={14} className="inline-block ml-1" />;
    if (msg.status === "delivered")
      return <CheckCheck size={14} className="inline-block ml-1" />;
    if (msg.status === "seen")
      return (
        <CheckCheck size={14} className="inline-block ml-1 text-blue-500" />
      );
    return null;
  };

  return (
    <main className="flex-1 overflow-y-auto px-2 sm:px-3 py-3 space-y-2 sm:space-y-3">
      {messages.map((msg, index) => {
        const isUser = msg.author === username;
        const hasText = !!msg.message?.trim();
        const hasFiles = Array.isArray(msg.file_url) && msg.file_url.length > 0;
        const showFileOnly = !hasText && hasFiles;

        return (
          <div
            key={msg.id}
            className={`relative flex ${
              isUser ? "justify-end" : "justify-start"
            } mb-2`}
          >
            <div
              className={`relative group space-y-1 max-w-[85%] md:max-w-[75%] lg:max-w-[70%] text-sm sm:text-base ${
                isUser ? "items-end" : "items-start"
              }`}
            >
              {/* Options button */}
              <button
                onClick={() => toggleDropdown(index)}
                className="absolute -top-2 -right-2 p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition"
              >
                <MoreVertical size={18} />
              </button>

              {/* File Messages */}
              {hasFiles &&
                msg.file_url.map((file, idx) => {
                  const rawFileName = file?.split("/").pop() || "";
                  const cleanedName = rawFileName
                    .replace(/-\d{10,}-\d+/, "")
                    .replace(/_/g, "");
                  const fileUrl = file?.startsWith("http")
                    ? file
                    : `${process.env.REACT_APP_API_URL}/gupshup/uploads/${file}`;
                  const isImage =
                    file?.match(/\.(jpeg|jpg|png|gif|webp)$/i) ||
                    file?.includes("image");

                  return isImage ? (
                    <img
                      key={idx}
                      src={fileUrl}
                      alt="attachment"
                      className="w-full max-w-[260px] sm:max-w-[320px] md:max-w-[400px] rounded-lg object-contain border cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onImageClick(fileUrl);
                      }}
                    />
                  ) : (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 bg-gray-100 border rounded-lg hover:bg-gray-200 transition cursor-pointer w-full max-w-[280px] sm:max-w-[340px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFileClick(fileUrl);
                      }}
                    >
                      <FileText className="text-blue-500 w-5 h-5 flex-shrink-0" />
                      <div className="flex flex-col flex-1">
                        <span className="font-medium text-sm truncate">
                          {cleanedName}
                        </span>
                        <span className="text-xs text-gray-500">
                          Tap to view
                        </span>
                      </div>
                      <a
                        href={fileUrl}
                        download
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  );
                })}

              {/* Text Messages */}
              {hasText && (
                <div
                  className={`relative inline-block px-3 py-2 rounded-2xl break-words shadow-sm cursor-pointer text-sm sm:text-base ${
                    isUser
                      ? "bg-blue-100 text-blue-900 self-end"
                      : "bg-white text-gray-800 self-start"
                  }`}
                  style={{ minWidth: "40px", maxWidth: "100%" }}
                >
                  {/* Reply Preview */}
                  {msg.replyTo && (
                    <div className="border-l-4 border-blue-400 pl-2 mb-2 text-xs bg-gray-50 rounded-md p-1 pr-6">
                      <strong className="block text-gray-700 text-xs mb-1">
                        {msg.replyTo.author}
                      </strong>

                      {/* If replyTo has text */}
                      {msg.replyTo.message && (
                        <p className="text-gray-600 whitespace-pre-wrap text-xs sm:text-sm mb-1 break-words">
                          {msg.replyTo.message}
                        </p>
                      )}
                      {Array.isArray(msg.replyTo.file_url) &&
                        msg.replyTo.file_url.length > 0 &&
                        msg.replyTo.file_url.map((file, idx) => {
                          const fileUrl = file.startsWith("http")
                            ? file
                            : `${process.env.REACT_APP_API_URL}/gupshup/uploads/${file}`;

                          const isImage = file.match(
                            /\.(jpeg|jpg|png|gif|webp)$/i
                          );

                          return isImage ? (
                            <img
                              key={idx}
                              src={fileUrl}
                              alt="reply-attachment"
                              className="max-w-[120px] max-h-24 rounded-md object-cover border mt-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                onImageClick(fileUrl);
                              }}
                            />
                          ) : (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-1 bg-gray-100 border rounded mt-1 w-fit cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                onFileClick(fileUrl);
                              }}
                            >
                              <FileText className="text-blue-500 w-4 h-4" />
                              <span className="text-xs text-gray-600 truncate max-w-[100px]">
                                {file.split("/").pop()}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {/* Main Message */}
                  <div className="flex items-end justify-between gap-2">
                    <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed break-words">
                      {msg.message}
                      {msg.edited && (
                        <span className="text-[10px] text-gray-400 ml-1">
                          (edited)
                        </span>
                      )}
                    </p>

                    <div className="flex items-center gap-[3px] text-[11px] text-gray-500 whitespace-nowrap self-end ml-2">
                      <span>{msg.time}</span>
                      {isUser && renderTicks(msg)}
                    </div>
                  </div>
                </div>
              )}

              {/* Time for file-only messages */}
              {!hasText && hasFiles && (
                <div className="flex justify-end mt-1 text-xs text-gray-500">
                  <span>{msg.time}</span>
                  {isUser && renderTicks(msg)}
                </div>
              )}
            </div>

            {/* Dropdown menu */}
            {activeDropdown === index && (
              <div
                ref={dropdownRef}
                className="absolute top-6 right-0 w-40 bg-white border rounded-lg shadow-lg z-50 p-2"
              >
                <button
                  onClick={() => {
                    onReply(msg);
                    setActiveDropdown(null);
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  Reply
                </button>

                {isUser && (
                  <>
                    {hasText && (
                      <>
                        <button
                          onClick={() => {
                            onEdit(msg);
                            setActiveDropdown(null);
                          }}
                          className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onCopy(msg.message);
                            setActiveDropdown(null);
                          }}
                          className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                        >
                          Copy
                        </button>
                      </>
                    )}

                    {(showFileOnly || hasFiles || hasText) && (
                      <button
                        onClick={() => {
                          onDelete(msg);
                          setActiveDropdown(null);
                        }}
                        className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-red-500"
                      >
                        Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

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
