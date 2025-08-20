import React, { useContext, useEffect, useRef, useState } from "react";
import { Send, Paperclip, Images } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "./context/SocketContext";
import { addChat, getChat, getRoom } from "./services";

import EmojiGifStickerDropdown from "./components/Dropdown";
import ChatMessages from "./components/ChatMessages";
import ChatHeader from "./components/ChatHeader";
import ZoomedContentModal from "./components/ZoomedContentModal";
import FilePreviewList from "./components/FilePreviewList";

const ChatPage = () => {
  const [input, setInput] = useState("");
  const [roomData, setRoomData] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messageList, setMessageList] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [zoomedContent, setZoomedContent] = useState(null);
  const [file, setFile] = useState([]);
  const [filePreview, setFilePreview] = useState([]);

  const typingTimeout = useRef(null);
  const bottomRef = useRef(null);
  const navigate = useNavigate();
  const socket = useContext(SocketContext);

  // Redirect to Join if not found
  useEffect(() => {
    const fetchRoom = async () => {
      const Username = localStorage.getItem("username");
      const Room = localStorage.getItem("room");
      if (!Username || !Room) {
        navigate("/");
        return;
      }
      try {
        const res = await getRoom({
          username: Username,
          room: Room,
        });
        if (res && res.success) {
          setRoomData({
            id: res.data.id, // 🆕 Get user_id
            username: res.data.username,
            room: res.data.room,
          });
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching room:", error);
        navigate("/");
      }
    };
    fetchRoom();
  }, [navigate]);

  //  Load old messages from localStorage
  useEffect(() => {
    if (roomData?.room) {
      fetchMessages();
    }
  }, [roomData]);

  //  Rejoin on socket reconnect
  useEffect(() => {
    if (!socket || !roomData) return;

    const handleReconnect = () => {
      socket.emit("join_room", {
        room: roomData.room,
        username: roomData.username,
      });
    };
    if (socket.connected) {
      handleReconnect();
    }
    socket.on("connect", handleReconnect);
    return () => socket.off("connect", handleReconnect);
  }, [socket, roomData]);

  //  Emit join_room and listen for updates
  useEffect(() => {
    if (!socket || !roomData) return;
    socket.emit("join_room", {
      room: roomData.room,
      username: roomData.username,
    });

    socket.on("user_list", setOnlineUsers);

    socket.on("typing", (typingUsername) => {
      if (typingUsername !== roomData.username) {
        setTypingUser(typingUsername);
      }
    });

    socket.on("stop_typing", () => setTypingUser(null));
    socket.on("receive_message", (data) => {
      console.log("Received:", data);
      setMessageList((prev) => [...prev, data]);
    });

    return () => {
      socket.off("user_list");
      socket.off("typing");
      socket.off("stop_typing");
      socket.off("receive_message");
    };
  }, [socket, roomData]);

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!roomData) return;

    socket.emit("typing", {
      room: roomData.room,
      username: roomData.username,
    });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing", {
        room: roomData.room,
        username: roomData.username,
      });
    }, 1500);
  };
  const fetchMessages = async () => {
    try {
      const res = await getChat({ room: roomData.room });
      if (res.result) {
        const formatted = res.result.map((msg) => ({
          room: msg.room_id,
          author: msg.user_id === roomData.id ? roomData.username : msg.user_id,
          message: msg.message,
          file_url: msg.file_url?.trim() ? msg.file_url : null,
          time: msg.time,
        }));
        setMessageList(formatted);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };
  const handleSend = async () => {
    const hasText = input.trim() !== "";
    const hasFiles = file?.length > 0;
    if (!hasText && !hasFiles) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const formData = new FormData();

    formData.append("user_id", roomData.id);
    formData.append("room_id", roomData.room);
    formData.append("message", input);
    formData.append("time", time);
    if (hasFiles) {
      file.forEach((f) => {
        formData.append("files", f); // append all files under the key "files"
      });
    }

    try {
      const res = await addChat(formData);
      const uploadedFiles = res.uploaded || [];

      uploadedFiles.forEach((fileName) => {
        const newMessage = {
          room: roomData.room,
          author: roomData.username,
          message: input,
          file_url: fileName, // use backend file name
          time,
        };

        socket.emit("send_message", newMessage);
        setMessageList((prev) => [...prev, newMessage]);
      });
      setInput("");
      setFile([]);
      setFilePreview([]);
      socket.emit("stop_typing", {
        room: roomData.room,
        username: roomData.username,
      });
    } catch (err) {
      console.error("Failed to send message:", err.message);
    }
    await fetchMessages();
  };
  // ✅ Leave room
  const handleLeaveRoom = () => {
    socket.disconnect();
    localStorage.clear();
    navigate("/");
  };
  const handleMediaSend = async (url) => {
    setShowDropdown(false);
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const formData = new FormData();
    formData.append("user_id", roomData.id);
    formData.append("room_id", roomData.room);
    formData.append("message", "");
    formData.append("file_url", url);
    formData.append("time", time);

    try {
      await addChat(formData);
      const newMessage = {
        room: roomData.room,
        author: roomData.username,
        message: "",
        file_url: url,
        time,
      };
      socket.emit("send_message", newMessage);
      setMessageList((prev) => [...prev, newMessage]);
    } catch (err) {
      console.error("Media send failed:", err.message);
    }
    console.log("formData", formData);
    await fetchMessages();
  };
  // ✅ Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  useEffect(() => {
    return () => {
      // Cleanup all previews on unmount
      filePreview.forEach(({ preview }) => URL.revokeObjectURL(preview));
    };
  }, []);

  if (!roomData) return <div className="p-4">Loading chat...</div>;

  return (
    <>
      <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <ChatHeader
          roomData={roomData}
          onlineUsers={onlineUsers}
          onLeave={handleLeaveRoom}
        />
        <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col px-4 py-2">
          <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-xl shadow-xl flex flex-col overflow-hidden">
            <ChatMessages
              messages={messageList}
              username={roomData.username}
              typingUser={typingUser}
              bottomRef={bottomRef}
              onImageClick={(url) => {
                setZoomedContent({ type: "image", url });
              }}
              onFileClick={async (url) => {
                let type = "file";
                if (url.match(/\.(mp4|webm)$/i)) type = "video";
                else if (url.match(/\.pdf$/i)) type = "pdf";
                else if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i))
                  type = "image";
                setZoomedContent({ type, url });
                await fetchMessages();
              }}
            />
            <footer className="border-t border-gray-200 bg-white px-4 py-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="relative w-full">
                  {/* Input wrapper */}
                  <div className="flex items-center border border-gray-300 rounded-full px-3 py-2 bg-white shadow-sm w-full">
                    {/* Emoji Button */}
                    <button
                      onClick={() => setShowDropdown((s) => !s)}
                      className="text-gray-500 mr-2"
                    >
                      <Images />
                    </button>
                    {/* File Upload */}
                    <label className="cursor-pointer text-gray-500 mr-2">
                      <Paperclip className="w-4 h-4" />
                      <input
                        type="file"
                        hidden
                        multiple
                        onChange={(e) => {
                          const selectedFiles = Array.from(e.target.files);
                          const previews = selectedFiles.map((file) => ({
                            file,
                            preview: URL.createObjectURL(file),
                          }));

                          setFile((prev) => [
                            ...(prev || []),
                            ...selectedFiles,
                          ]);
                          setFilePreview((prev) => [
                            ...(prev || []),
                            ...previews,
                          ]);
                          e.target.value = null;
                        }}
                      />
                    </label>
                    {/* Text Input */}
                    <input
                      type="text"
                      value={input}
                      onChange={handleTyping}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type your message..."
                      className="flex-1 outline-none text-sm bg-transparent"
                    />
                    {/* Send Button */}
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() && file.length === 0}
                      className="ml-2 h-8 w-8 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white disabled:opacity-50"
                      type="button"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                  {/* ✅ Unified Dropdown Component */}
                  {showDropdown && (
                    <EmojiGifStickerDropdown
                      apiKey={process.env.REACT_APP_GIPHY_API_KEY}
                      onSelectEmoji={(emoji) =>
                        setInput((prev) => prev + emoji.native)
                      }
                      onSelectGif={(url) => handleMediaSend(url)}
                      onSelectSticker={(url) => handleMediaSend(url)}
                    />
                  )}

                  <ZoomedContentModal
                    content={zoomedContent}
                    onClose={() => setZoomedContent(null)}
                  />

                  {/* File Previews (below input) */}
                  <FilePreviewList
                    filePreview={filePreview}
                    onRemove={(idx, preview) => {
                      URL.revokeObjectURL(preview);
                      setFile((prev) => prev.filter((_, i) => i !== idx));
                      setFilePreview((prev) =>
                        prev.filter((_, i) => i !== idx)
                      );
                    }}
                  />
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPage;
