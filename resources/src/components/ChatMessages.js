import React, { useEffect, useRef, useState } from "react";
import { FileText, Download, MoreVertical } from "lucide-react";

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
  onReact,
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <main className="flex-1 overflow-y-auto px-3 py-4 space-y-3 sm:space-y-4">
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
            }`}
          >
            <div className="relative group space-y-1 max-w-[90%] sm:max-w-[75%] text-sm sm:text-base">
              {/* Toggle button */}
              <button
                onClick={() => toggleDropdown(index)}
                className="absolute -top-2 -right-2 p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition"
              >
                <MoreVertical size={18} />
              </button>

              {/* File Content */}
              {hasFiles &&
                msg.file_url.map((file, idx) => {
                  const rawFileName = file?.split("/").pop() || "";
                  const cleanedName = rawFileName
                    .replace(/-\d{10,}-\d+/, "")
                    .replace(/_/g, "");
                  const fileName = cleanedName;
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
                      className="max-w-full max-h-60 sm:max-w-[260px] rounded-md object-contain border"
                      onClick={(e) => {
                        e.stopPropagation();
                        onImageClick(fileUrl);
                      }}
                    />
                  ) : (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 bg-gray-100 border rounded-md hover:bg-gray-200 transition"
                      onClick={(e) => {
                        e.stopPropagation();
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
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  );
                })}

              {hasText && (
                <div
                  className={`relative inline-block px-3 py-2 rounded-2xl break-words shadow-sm ${
                    isUser
                      ? "bg-blue-100 text-blue-900"
                      : "bg-white text-gray-800"
                  }`}
                  style={{ minWidth: "30px" }} // to avoid bubble shrinking too much
                >
                  {/* Reply section (if any) */}
                  {msg.replyTo && (
                    <div className="border-l-4 border-blue-400 pl-2 mb-2 text-xs bg-gray-50 rounded-md p-1 pr-6">
                      <strong className="block text-gray-700 text-xs">
                        {msg.replyTo.author}
                      </strong>
                      {msg.replyTo.message && (
                        <p className="text-gray-600 truncate">
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

                  {/* Main message */}
                  {msg.edited ? (
                    <p className="text-[10px] text-gray-400 ml-1">(edited) </p>
                  ) : (
                    <p className="whitespace-pre-wrap pr-10"> {msg.message}</p>
                  )}
                  <span className="absolute bottom-1 right-2 text-[10px] text-gray-500">
                    {msg.time}
                  </span>
                </div>
              )}

              {/* File-only messages → keep time below */}
              {!hasText && hasFiles && (
                <span className="text-xs text-gray-500 mt-1 block text-right">
                  {msg.time}
                </span>
              )}
            </div>

            {/* Dropdown menu */}
            {activeDropdown === index && (
              <div
                ref={dropdownRef}
                className="absolute top-6 right-0 w-40 bg-white border rounded-lg shadow-lg z-50 p-2"
              >
                {/* Reply (always) */}
                <button
                  onClick={() => {
                    onReply(msg);
                    setActiveDropdown(null);
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  Reply
                </button>

                {/* Sender options */}
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

                    {/* For files/images/gifs/stickers → Delete only */}
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

                {/* React (always) */}
                <button
                  onClick={() => {
                    onReact(msg);
                    setActiveDropdown(null);
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  React 😊
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Typing indicator */}
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
