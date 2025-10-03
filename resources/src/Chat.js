import React, { useContext, useEffect, useRef, useState } from "react";
import { Send, Paperclip, Images, FileText, X, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "./context/SocketContext";
import { addChat, deleteChat, getChat, getRoom, updateChat } from "./services";

import EmojiGifStickerDropdown from "./components/Dropdown";
import ChatMessages from "./components/ChatMessages";
import ChatHeader from "./components/ChatHeader";
import ZoomedContentModal from "./components/ZoomedContentModal";
import FilePreviewList from "./components/FilePreviewList";

const ChatPage = () => {
  const [input, setInput] = useState("");
  const [roomData, setRoomData] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [messageList, setMessageList] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [zoomedContent, setZoomedContent] = useState(null);
  const [file, setFile] = useState([]);
  const [filePreview, setFilePreview] = useState([]);
  const [replyTo, setReplyTo] = useState(null);

  const typingTimeout = useRef(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
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

    // socket.on("user_list", setOnlineUsers);
    // socket.on("user_list", (users) => {
    //   const uniqueUsers = Array.from(
    //     new Map(users.map((u) => [u.username, u])).values()
    //   );
    //   setOnlineUsers(uniqueUsers);
    // });
    socket.on("user_list", (users) => {
      const formattedUsers = users.map((u) => ({
        id: u.id,
        username: u.username,
        online: u.online_status === "online",
        room: u.room_id,
      }));

      const uniqueUsers = Array.from(
        new Map(formattedUsers.map((u) => [u.username, u])).values()
      );

      setOnlineUsers(uniqueUsers);
    });
    socket.on("typing", (typingUsername) => {
      if (typingUsername !== roomData.username) {
        setTypingUser(typingUsername);
      }
    });

    socket.on("stop_typing", () => setTypingUser(null));

    socket.on("receive_message", (newMessage) => {
      setMessageList((prev) => [...prev, newMessage]);
    });

    socket.on("updated_message", (data) => {
      // console.log("🔄 Received updated message:", data);
      setMessageList((prev) =>
        prev.map((m) =>
          m.id === data.id
            ? { ...m, message: data.message, edited: data.edited }
            : m
        )
      );
    });

    socket.on("deleted_message", (data) => {
      setMessageList((prev) => prev.filter((m) => m.id !== data.id));
    });


    return () => {
      socket.off("user_list");
      socket.off("typing");
      socket.off("stop_typing");
      socket.off("receive_message");
      socket.off("updated_message");
      socket.off("deleted_message");
      socket.off("reacted_message");
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
          id: msg.id,
          room: msg.room_id,
          user_id: msg.user_id,
          author: msg.user_id === roomData.id ? roomData.username : msg.author,
          message: msg.message,
          file_url: msg.file_url ? msg.file_url : null,
          time: msg.time,
          edited: msg.edited,
          replyTo: msg.replyTo,
        }));
        setMessageList(formatted);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleLeaveRoom = () => {
    socket.disconnect();
    localStorage.clear();
    navigate("/");
  };

  const handleSend = async (url) => {
    const hasText = input.trim() !== "";
    const hasFiles = file?.length > 0;
    const hasUrl = !!url;

    if (!hasText && !hasFiles && !hasUrl) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const formData = new FormData();
    formData.append("user_id", roomData.id);
    formData.append("room_id", roomData.room);
    formData.append("message", hasText ? input : "");
    formData.append("time", time);

    if (hasFiles) {
      file.forEach((f) => {
        formData.append("files", f);
      });
    }

    if (hasUrl) {
      formData.append("file_url", url);
    }
    if (replyTo) {
      formData.append("reply_to_id", replyTo.id);
    }

    try {
      const res = await addChat(formData);
      const newMessage = res.data;
      if (replyTo) {
        newMessage.replyTo = {
          id: replyTo.id,
          author: replyTo.author,
          message: replyTo.message,
          files: replyTo.files,
          file_url: replyTo.file_url,
          edited: replyTo.edited || 0,
        };
      }
      console.log("result", newMessage);
      socket.emit("send_message", newMessage);

      // Reset states
      setInput("");
      setFile([]);
      setFilePreview([]);
      setShowDropdown(false); // for GIF/sticker dropdown
      if (fileInputRef.current) fileInputRef.current.value = "";
      setReplyTo(null);
      socket.emit("stop_typing", {
        room: roomData.room,
        username: roomData.username,
      });
    } catch (err) {
      console.error("Failed to send message:", err.message);
    }
  };

  const handleEdit = async (editingId) => {
    if (!editingId || !input.trim()) return;
    console.log("editingID : ", editingId);
    const formData = {
      id: editingId,
      user_id: roomData.id,
      message: input,
    };
    console.log("Edit FormData:", formData);
    try {
      const res = await updateChat(formData);
      console.log("update res", res);
      const updatedMessage = res.updatedMessage;
      console.log("updatedMessage", updatedMessage);
       socket.emit("update_message", {
        id: updatedMessage.id,
        user_id: updatedMessage.user_id,
        message: updatedMessage.message,
        room: roomData.room,
        edited: 1,
      });
      setMessageList((prev) =>
        prev.map((m) =>
          m.id === updatedMessage.id
            ? { ...m, message: updatedMessage.message, edited: 1 }
            : m
        )
      );
      setEditingId(null);
      setInput("");
    } catch (err) {
      console.error("Failed to update message:", err.message);
    }
  };

  const handleDelete = async (msg) => {
    const formData = {
      id: msg.id,
      user_id: msg.user_id,
    };
    try {
      const res = await deleteChat(formData);
      socket.emit("delete_message", {
        id: msg.id,
        room: res.room_id,
      });
      setMessageList((prev) => prev.filter((m) => m.id !== msg.id));
    } catch (err) {
      console.error("Failed to delete message:", err.message);
    }
  };

  //  Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  useEffect(() => {
    return () => {
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
              }}
              onReply={(msg) => {
                setReplyTo(msg);
                console.log("Reply to:", msg);
              }}
              onEdit={(msg) => {
                setEditingId(msg.id);
                setInput(msg.message);
                console.log("Edit message:", msg);
              }}
              onCopy={(text) => {
                navigator.clipboard.writeText(text);
                alert("Copied!");
              }}
              onDelete={handleDelete}
            />
            <footer className="border-t border-gray-200 bg-white px-4 py-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full relative">
                {/* ✅ Reply Box ABOVE input */}
                {replyTo && (
                  <div className="reply-box bg-gray-100 p-2 rounded-md mb-2 border-l-4 border-blue-400 relative">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-700">
                        Replying to {replyTo.author}
                      </span>
                      <button
                        onClick={() => setReplyTo(null)}
                        className="text-gray-500 hover:text-red-500 text-sm ml-2"
                      >
                        <X />
                      </button>
                    </div>

                    {replyTo.message && (
                      <p className="text-sm text-gray-600 truncate">
                        {replyTo.message}
                      </p>
                    )}

                    {replyTo.file_url?.length > 0 && (
                      <div className="flex gap-2 mt-1">
                        {replyTo.file_url.map((file, idx) => {
                          const isImage = file.match(
                            /\.(jpeg|jpg|png|gif|webp)$/i
                          );
                          const fileUrl = file.startsWith("http")
                            ? file
                            : `${process.env.REACT_APP_API_URL}/gupshup/uploads/${file}`;

                          return isImage ? (
                            <img
                              key={idx}
                              src={fileUrl}
                              alt="reply-preview"
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <FileText
                              key={idx}
                              className="w-5 h-5 text-blue-500"
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                <div className="relative w-full">
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
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (editingId ? handleEdit(editingId) : handleSend())
                      }
                      placeholder={
                        editingId
                          ? "Edit your message...."
                          : "Type your message..."
                      }
                      className="flex-1 outline-none text-sm bg-transparent"
                    />
                    {/* Cancel Edit Button */}
                    {editingId && (
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setInput("");
                        }}
                        className="ml-2 h-8 w-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                        type="button"
                      >
                        <X />
                      </button>
                    )}
                    {/* Send Button */}
                    <button
                      onClick={() =>
                        editingId ? handleEdit(editingId) : handleSend()
                      }
                      disabled={!input.trim() && file.length === 0}
                      className="ml-2 h-8 w-8 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white disabled:opacity-50"
                      type="button"
                    >
                      {editingId ? <Check /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* ✅ Unified Dropdown Component */}
                  {showDropdown && (
                    <EmojiGifStickerDropdown
                      apiKey={process.env.REACT_APP_GIPHY_API_KEY}
                      onSelectEmoji={(emoji) =>
                        setInput((prev) => prev + emoji.native)
                      }
                      onSelectGif={(url) => handleSend(url)}
                      onSelectSticker={(url) => handleSend(url)}
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
