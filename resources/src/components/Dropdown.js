import React, { useState } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import GiphyToggleSearchbox from "./Giphy";
import { Sticker } from "lucide-react";

const EmojiGifStickerDropdown = ({
  apiKey,
  onSelectEmoji,
  onSelectGif,
  onSelectSticker,
}) => {
  const [tab, setTab] = useState("emoji"); // "emoji" | "gifs" | "stickers"
  const api_Key = apiKey;
  return (
    <div className="absolute bottom-16 left-4 z-20 w-[300px] bg-white border rounded-lg shadow-md">
      {/* Tab Switcher */}
      <div className="flex justify-around bg-gray-100 p-1 text-sm font-medium">
        <button
          onClick={() => setTab("emoji")}
          className={`px-2 py-1 rounded ${
            tab === "emoji" ? "font-bold text-blue-500" : ""
          }`}
        >
          😀
        </button>
        <button
          onClick={() => setTab("gifs")}
          className={`px-2 py-1 rounded ${
            tab === "gifs" ? "font-bold text-blue-500" : ""
          }`}
        >
          GIF
        </button>
        <button
          onClick={() => setTab("stickers")}
          className={`px-2 py-1 rounded ${
            tab === "stickers" ? "font-bold text-blue-500" : ""
          }`}
        >
          <Sticker size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="p-2 max-h-[300px] overflow-y-auto">
        {tab === "emoji" && (
          <Picker data={data} onEmojiSelect={onSelectEmoji} />
        )}

        {(tab === "gifs" || tab === "stickers") && (
          <GiphyToggleSearchbox
            apiKey={api_Key}
            type={tab}
            onSelect={(url) =>
              tab === "gifs" ? onSelectGif(url) : onSelectSticker(url)
            }
          />
        )}
      </div>
    </div>
  );
};

export default EmojiGifStickerDropdown;
