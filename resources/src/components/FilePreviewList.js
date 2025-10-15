import React from "react";
import getFileIcon from "./FileIcon";
import { X } from "lucide-react";

const FilePreviewList = ({ filePreview, onRemove }) => {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {filePreview.map(({ file, preview }, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2 text-xs sm:text-sm bg-gray-50 rounded-lg px-2 py-1 shadow-sm w-full sm:w-auto max-w-full sm:max-w-[220px] md:max-w-[280px] lg:max-w-[320px]"
        >
          {/* Show preview if image */}
          {file.type.startsWith("image/") ? (
            <img
              src={preview}
              alt={file.name}
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-md"
            />
          ) : (
            <span className="flex items-center gap-1 truncate text-gray-700 max-w-[calc(100%-24px)] sm:max-w-[150px] md:max-w-[200px]">
              {getFileIcon(file.name)} {file.name}
            </span>
          )}

          {/* Remove button */}
          <button
            onClick={() => onRemove(idx, preview)}
            className="ml-auto text-gray-500 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default FilePreviewList;
