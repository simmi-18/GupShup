import React, { useState } from "react";
import QrScanner from "react-qr-scanner";
import { X } from "lucide-react";

const QRScannerModal = ({ onClose, onResult }) => {
  const [scanned, setScanned] = useState(false);

  const handleScan = (data) => {
    if (data && !scanned) {
      setScanned(true);
      try {
        if (onResult) onResult(data.text || data);
      } catch (error) {
        console.error("QR Scan Result Error:", error);
      }
      setTimeout(() => {
        if (onClose) onClose();
      }, 500);
    }
  };

  const handleError = (err) => {
    console.error("QR Scan Error:", err);
  };

  const previewStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  return (
    <div className="fixed inset-0 bg-[#111b21] flex flex-col items-center justify-center z-[9999] text-white">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 border-b border-gray-700 bg-[#202c33]">
        <h2 className="text-lg font-semibold">Scan QR Code to Join</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition"
        >
          <X size={22} />
        </button>
      </div>

      {/* Scanner Box */}
      <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-2xl overflow-hidden mt-20 border-4 border-white/20">
        <QrScanner
          delay={300}
          onError={handleError}
          onScan={handleScan}
          style={previewStyle}
          facingMode="environment"
        />
        {/* Animated Scanner Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-green-400 animate-scan" />
      </div>

      <p className="text-gray-300 text-sm mt-6 text-center px-4">
        Align the QR code within the frame
      </p>

      <style>
        {`
          @keyframes scan {
            0% { transform: translateY(0); opacity: 0.7; }
            50% { transform: translateY(288px); opacity: 1; }
            100% { transform: translateY(0); opacity: 0.7; }
          }
          .animate-scan {
            animation: scan 2.5s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
};

export default QRScannerModal;
