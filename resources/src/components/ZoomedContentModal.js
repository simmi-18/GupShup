import React, { useState } from "react";
import { X, Plus, Minus, RotateCw } from "lucide-react";

const ZoomedContentModal = ({ content, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!content) return null;

  const isImage = content.type === "image";
  const isVideo = content.url?.match(/\.(mp4|webm)$/i);
  const isPDF = content.url?.match(/\.pdf$/i);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleSliderChange = (e) => setZoom(parseFloat(e.target.value));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl z-50"
        title="Close"
      >
        <X />
      </button>

      {/* Controls */}
      {isImage && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 
                     z-50 flex items-center gap-3 bg-white/10 backdrop-blur-md 
                     px-4 py-2 rounded-xl border border-white/20 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleRotate}
            className="text-white hover:text-yellow-300 text-xl"
            title="Rotate"
          >
            <RotateCw />
          </button>
          <button
            onClick={handleZoomOut}
            className="text-white hover:text-gray-300 text-2xl"
            title="Zoom Out"
          >
            <Minus />
          </button>
          <input
            type="range"
            min="0.75"
            max="3"
            step="0.25"
            value={zoom}
            onChange={handleSliderChange}
            className="w-28 h-1 accent-blue-500 bg-gray-700 rounded cursor-pointer"
            title="Zoom"
          />
          <button
            onClick={handleZoomIn}
            className="text-white hover:text-gray-300 text-2xl"
            title="Zoom In"
          >
            <Plus />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div
        className="relative flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "85vw",
          maxHeight: "80vh",
        }}
      >
        {isImage ? (
          <div
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: "transform 0.3s ease",
              transformOrigin: "center center",
            }}
          >
            <img
              src={content.url}
              alt="Zoomed"
              style={{
                width: `${50 + zoom * 10}vw`, // 🔹 grows in width
                height: "auto",
                maxHeight: "70vh", // 🔹 keeps within modal height
              }}
              className="object-contain rounded-lg shadow-2xl"
            />
          </div>
        ) : isVideo ? (
          <video
            src={content.url}
            controls
            className="rounded-lg shadow-2xl max-h-[70vh] max-w-[80vw] object-contain"
          />
        ) : isPDF ? (
          <iframe
            src={content.url}
            title="PDF Preview"
            className="w-[85vw]  h-[70vh]  border rounded-lg bg-white shadow-2xl"
          />
        ) : (
          <div className="text-white text-center">
            <p>Unsupported file type</p>
            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-400 hover:text-blue-200"
            >
              Open in new tab
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoomedContentModal;
