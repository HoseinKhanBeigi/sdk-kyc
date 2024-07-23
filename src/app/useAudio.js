import react, { useEffect } from "react";

export const useAudio = (audioRef, setPlay, play) => {
  if (audioRef.current && play === true) {
    console.log(audioRef.current);
    const playAudio = async () => {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error("Failed to play audio:", error);
      }
    };
    playAudio();
  }

  const handlePlay = () => {
    setPlay(!play);
  };

  return { handlePlay };
};
