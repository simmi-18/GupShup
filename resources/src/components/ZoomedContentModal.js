import React, { useState } from "react";
import { X, Plus, Minus, RotateCw } from "lucide-react";

const ZoomedContentModal = ({ content, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!content) return null;

  const isImage = content.type === "image";
  const isVideo = content.url?.match(/\.(mp4|webm)$/i);
  const isPDF = content.url?.match(/\.pdf$/i);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.2));
  const handleSliderChange = (e) => setZoom(parseFloat(e.target.value));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center "
      onClick={onClose}
    >
      {/* Close Button - top right */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-gray-500 hover:text-gray-100 text-3xl p-2 z-50"
        title="Close"
      >
        <X />
      </button>

      {/* Controls - bottom left */}
      {isImage && (
        <div
          className="absolute bottom-6 left-6 z-50 flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 shadow-lg"
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
            min="0.2"
            max="3"
            step="0.1"
            value={zoom}
            onChange={handleSliderChange}
            className="w-32 h-1 accent-blue-500 bg-gray-700 rounded cursor-pointer"
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

      {/* Main content container */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {isImage ? (
          <img
            src={content.url}
            alt="Zoomed"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: "transform 0.3s ease",
            }}
            className="max-h-[80vh] max-w-[80vw] object-contain rounded-lg shadow-2xl"
          />
        ) : isVideo ? (
          <video
            src={content.url}
            controls
            className="rounded-lg shadow-2xl max-h-[80vh] max-w-[80vw] object-contain"
          />
        ) : isPDF ? (
          <iframe
            src={content.url}
            title="PDF Preview"
            className="w-[80vw] h-[80vh] border rounded-lg bg-white shadow-2xl"
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
