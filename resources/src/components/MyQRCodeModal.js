import React from "react";
import QRCode from "react-qr-code";
import { X } from "lucide-react";

const MyQRCodeModal = ({ onClose, room }) => {
  const qrValue = JSON.stringify({ room });

  return (
    <div className="fixed inset-0 bg-[#111b21] flex flex-col items-center justify-center z-[9999]  text-white">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 border-b border-gray-700 bg-[#202c33]">
        <h2 className="text-lg font-semibold">My QR Code</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition"
        >
          <X size={22} />
        </button>
      </div>

      {/* Center content */}
      <div className="flex flex-col items-center mt-16">
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <QRCode value={qrValue} size={220} />
        </div>

        <p className="text-gray-300 text-sm mt-6 text-center">
          Scan this QR code to Join the room
        </p>
      </div>

      {/* Bottom footer text (optional like WhatsApp) */}
      <div className="absolute bottom-6 text-gray-500 text-xs text-center px-4">
        This QR code is unique to your account.
      </div>
    </div>
  );
};

export default MyQRCodeModal;
