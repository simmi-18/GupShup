const getFileIcon = (filename) => {
  const ext = filename.split(".").pop().toLowerCase();
  const map = {
    pdf: "📄",
    doc: "📃",
    docx: "📃",
    xls: "📊",
    xlsx: "📊",
    ppt: "📈",
    pptx: "📈",
    zip: "🗜️",
    rar: "🗜️",
    mp3: "🎵",
    mp4: "🎞️",
    txt: "📑",
  };
  return map[ext] || "📁";
};

export default getFileIcon;
