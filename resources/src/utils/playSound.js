let audioUnlocked = false;
const audioCache = {};

export const unlockAudio = async () => {
  if (audioUnlocked) return;
  try {
    const clickSound = new Audio("/sounds/send.mp3");
    clickSound.volume = 0.001; // very low
    await clickSound.play();
    audioUnlocked = true;
    console.log("✅ Audio unlocked successfully");
  } catch (err) {
    console.warn("⚠️ Audio unlock failed:", err.message);
  }
};

export const playSound = async (type) => {
  if (!audioUnlocked) {
    console.warn("🔇 Audio still locked — user hasn't clicked yet");
    return;
  }
  const basePath = window.location.origin;
  const sounds = {
    send: `${basePath}/sounds/send.mp3`,
    receive: `${basePath}/sounds/receive.mp3`,
  };

  const path = sounds[type];
  if (!path) return;

  try {
    if (!audioCache[path]) {
      const audio = new Audio(path);
      audio.preload = "auto";
      audioCache[path] = audio;
    }

    const audio = audioCache[path].cloneNode(true);
    audio.volume = 1.0;
    audio.currentTime = 0;
    console.log(`📩 Playing ${type} sound`);
    await audio.play();
    console.log(`🎵 Played ${type} sound`);
  } catch (err) {
    console.error(`⚠️ ${type} sound blocked or failed:`, err.message);
  }
};
