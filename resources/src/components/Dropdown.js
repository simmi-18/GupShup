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
  const [tab, setTab] = useState("emoji");
  const api_Key = apiKey;

  return (
    <div
      className="
        absolute bottom-16 left-2 sm:left-4 z-20 
        w-[90vw] max-w-[360px] sm:w-[360px] 
        bg-white border rounded-lg shadow-md flex flex-col 
        max-h-[70vh] sm:max-h-[500px] overflow-hidden
      "
    >
      {/* Tab Switcher */}
      <div className="flex justify-around bg-gray-100 p-1 text-sm font-medium">
        <button
          onClick={() => setTab("emoji")}
          className={`px-2 py-1 rounded transition-colors ${
            tab === "emoji" ? "font-bold text-blue-500" : "text-gray-600"
          }`}
        >
          😀
        </button>
        <button
          onClick={() => setTab("gifs")}
          className={`px-2 py-1 rounded transition-colors ${
            tab === "gifs" ? "font-bold text-blue-500" : "text-gray-600"
          }`}
        >
          GIF
        </button>
        <button
          onClick={() => setTab("stickers")}
          className={`px-2 py-1 rounded transition-colors ${
            tab === "stickers" ? "font-bold text-blue-500" : "text-gray-600"
          }`}
        >
          <Sticker size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "emoji" && (
          <Picker
            data={data}
            onEmojiSelect={(emoji) => {
              onSelectEmoji(emoji);
            }}
            theme="light"
            previewPosition="none"
            searchPosition="top"
            navPosition="top"
            perLine={window.innerWidth < 400 ? 6 : 9} // ✅ fewer emojis per line on small screens
            maxFrequentRows={2}
          />
        )}
        {(tab === "gifs" || tab === "stickers") && (
          <div className="mt-3">
            <GiphyToggleSearchbox
              apiKey={api_Key}
              type={tab}
              onSelect={(url) =>
                tab === "gifs" ? onSelectGif(url) : onSelectSticker(url)
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmojiGifStickerDropdown;
