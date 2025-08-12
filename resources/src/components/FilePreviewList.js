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

// import React from "react";
// import { X, FileText } from "lucide-react";

// const FilePreviewList = ({ filePreview = [], onRemove }) => {
//   if (filePreview.length === 0) return null;

//   return (
//     <div className="mt-2 flex flex-wrap gap-3">
//       {filePreview.map(({ file, preview }, idx) => {
//         const isImage = file.type.startsWith("image/");
//         const isVideo = file.type.startsWith("video/");

//         return (
//           <div
//             key={idx}
//             className="relative bg-white border shadow-sm rounded-lg p-2 max-w-[160px] w-full"
//           >
//             <button
//               onClick={() => onRemove(idx, preview)}
//               className="absolute top-1 right-1 text-red-500 hover:text-red-700"
//               title="Remove"
//             >
//               <X className="w-4 h-4" />
//             </button>

//             {isImage ? (
//               <img
//                 src={preview}
//                 alt="preview"
//                 className="w-full h-24 object-cover rounded mb-1"
//               />
//             ) : isVideo ? (
//               <video
//                 src={preview}
//                 controls
//                 className="w-full h-24 object-cover rounded mb-1"
//               />
//             ) : (
//               <div className="w-full h-24 flex flex-col items-center justify-center text-gray-600 border border-dashed rounded mb-1">
//                 <FileText className="w-6 h-6" />
//                 <span className="text-xs mt-1">File</span>
//               </div>
//             )}

//             <p className="text-xs text-gray-700 truncate text-center">
//               {file.name}
//             </p>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default FilePreviewList;
