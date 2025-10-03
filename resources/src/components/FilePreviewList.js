import React from "react";
import getFileIcon from "./FileIcon";
import { X } from "lucide-react";

const FilePreviewList = ({ filePreview, onRemove }) => {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {filePreview.map(({ file, preview }, idx) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          {file.type.startsWith("image/") ? (
            <img
              src={preview}
              alt={file.name}
              className="w-8 h-8 object-contain"
            />
          ) : (
            <span className="flex items-center gap-1 truncate max-w-[120px]">
              {getFileIcon(file.name)} {file.name}
            </span>
          )}
          <button
            onClick={() => onRemove(idx, preview)}
            className="text-gray-500 hover:text-red-500"
          >
            <X />
          </button>
        </div>
      ))}
    </div>
  );
};

export default FilePreviewList;
