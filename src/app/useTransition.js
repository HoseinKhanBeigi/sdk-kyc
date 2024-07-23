import { useRef } from "react";

export const usePlayTransition = (removeToggle11, boxRef) => {
  const isActiveRef = useRef();
  return (id) => {
    let start;
    const toggleClass = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      if (elapsed >= 500) {
        isActiveRef.current = !isActiveRef.current;
        if (boxRef.current[id]) {
          boxRef.current[id].className = isActiveRef.current
            ? "chip active"
            : "chip inactive";
        }
        start = timestamp; // Reset the start time
      }

      // Request the next frame
      removeToggle11.current = requestAnimationFrame(toggleClass);
    };

    // Start the animation
    removeToggle11.current = requestAnimationFrame(toggleClass);
  };
};

export const useStopTransition = (removeToggle11, boxRef) => {
  return (id) => {
    if (removeToggle11.current) {
      cancelAnimationFrame(removeToggle11.current);
      boxRef.current[id].className = "chip active";
    }
  };
};
