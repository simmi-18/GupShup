import React, { useRef, useState, useEffect } from "react";
import { Camera, Edit2, Trash2 } from "lucide-react";

const ProfileImage = ({ onImageSelect }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const imageURL = URL.createObjectURL(file);
      setPreview(imageURL);
      setSelectedFile(file);
      localStorage.setItem("profileImage", imageURL);
      if (onImageSelect) onImageSelect(file);
      // ✅ store File object
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete your profile photo?")) {
      setPreview(null);
      setSelectedFile(null);
      localStorage.removeItem("profileImage");
      if (onImageSelect) onImageSelect(null);
    }
  };

  useEffect(() => {
    const storedImage = localStorage.getItem("profileImage");
    if (storedImage) {
      setPreview(storedImage);
    }
  }, []);

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Outer gradient border */}
      <div
        className="p-[3px] rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 hover:from-indigo-500 hover:to-pink-500 transition-all duration-500 shadow-lg"
        onClick={handleClick}
      >
        {/* Inner image container */}
        <div className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-white cursor-pointer">
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all">
              <Camera className="w-6 h-6 mb-1 text-indigo-500" />
              <span className="text-xs font-medium">Upload</span>
            </div>
          )}

          {/* Hover overlay with buttons */}
          {preview && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                  className="p-2 bg-white/90 rounded-full hover:bg-indigo-500 hover:text-white shadow-md transition"
                  title="Change Photo"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="p-2 bg-white/90 rounded-full hover:bg-red-500 hover:text-white shadow-md transition"
                  title="Delete Photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ProfileImage;
