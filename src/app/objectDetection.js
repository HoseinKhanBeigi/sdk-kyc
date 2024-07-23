"use client";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { FaceSvg } from "./faceSvg";
// import loadFaceMesh from "./faceMesh";
import { useFaceMesh } from "./useFaceMesh";
import { useAudio } from "./useAudio";
import { usePlayTransition, useStopTransition } from "./useTransition";
import "./ObjectDetection.css";

const ObjectDetection = ({ handleSendVideo, actions }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [currentStep, setCurrentStep] = useState("center");
  const startActions = useRef(false);
  const [mappedSteps, setMappedSteps] = useState([]);
  const [isFaceInCorrectPosition, setIsFaceInCorrectPosition] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [firstStepCompleted, setFirstStepCompleted] = useState(false);
  const [sequenceCompleted, setSequenceCompleted] = useState(false);
  const [_, setCurrentStepIndex] = useState();
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const isActiveRef = useRef(false);
  const removeToggle1 = useRef();
  const isActiveRef1 = useRef(false);
  const removeToggle11 = useRef();
  const videoContainer = useRef("");
  const boxRef = useRef([]);
  const audioRef = useRef(null);
  const [play, setPlay] = useState(false);
  const [voiceTrack, setVoiceTrack] = useState("");
  const stateMachine = useRef("");
  const mediaRecorderRef = useRef(null);
  const boxShadowDown = useRef("0px 90px 80px -28px lime");
  const boxShadowUp = useRef("0px -90px 80px -28px lime");
  const boxShadowRight = useRef("90px 0px 80px -28px lime");
  const boxShadowLeft = useRef("-90px 0px 80px -28px lime");
  const [steps] = useState([
    {
      step: "center",
      hint: "First, put your face in the center of the camera.",
    },
    { step: actions[1], hint: `Now, turn your face to the ${actions[1]}.` },
    { step: actions[2], hint: `Next, turn your face to the ${actions[2]}.` },
    { step: actions[3], hint: `Next, turn your face to the ${actions[3]}` },
  ]);
  const { handlePlay } = useAudio(audioRef, setPlay, play);

  const transitionBoxShadow = (boxShadow) => {
    let start;
    let box = "";

    const toggleClass = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;

      if (elapsed >= 500) {
        if (boxShadow === "left") {
          box = boxShadowLeft.current;
        }
        if (boxShadow === "right") {
          box = boxShadowRight.current;
        }
        if (boxShadow === "up") {
          box = boxShadowUp.current;
        }
        if (boxShadow === "down") {
          box = boxShadowDown.current;
        }

        isActiveRef.current = !isActiveRef.current;
        if (containerRef.current) {
          containerRef.current.style.boxShadow = isActiveRef.current
            ? box
            : "0px 0px 29px -28px transparent";
        }
        start = timestamp; // Reset the start time
      }

      // Request the next frame
      removeToggle1.current = requestAnimationFrame(toggleClass);
    };

    // Start the animation
    removeToggle1.current = requestAnimationFrame(toggleClass);
  };

  const stopTransition = () => {
    if (removeToggle1.current) {
      cancelAnimationFrame(removeToggle1.current);
      containerRef.current.style.boxShadow = "0px 0px 29px -28px transparent";
    }
  };

  const handleVoiceTrack = (action) => {
    handlePlay();
    if (action === "finish") {
      setPlay(false);
    }

    if (action === "center") {
      setVoiceTrack("center.mp3");
    }
    if (action === "left") {
      setVoiceTrack("nowLeft.mp3");
    }
    if (action === "right") {
      setVoiceTrack("pleaseRight.mp3");
    }
    if (action === "up") {
      setVoiceTrack("pleaseUp.mp3");
    }
    if (action === "down") {
      setVoiceTrack("nowDown.mp3");
    }
  };

  const handleSequencesForJustHint = (steps) => {
    const executeStep = (index) => {
      if (index >= steps.length) {
        return Promise.resolve();
      }

      const step = steps[index];
      return new Promise((resolve) => {
        step.action();
        setTimeout(() => {
          resolve();
        }, 4000);
      }).then(() => executeStep(index + 1));
    };
    setTimeout(() => {
      return executeStep(0);
    }, 0);
    // return executeStep(0);
  };

  const startAnimation = usePlayTransition(removeToggle11, boxRef);
  const stopAnimation = useStopTransition(removeToggle11, boxRef);
  const stepsSequences = [
    {
      name: "Step 1",
      action: () => {
        startAnimation(0);
        // startAnimation(1);
        transitionBoxShadow(actions[0]);
        handleVoiceTrack(actions[0]);
      },
      // delay: 1000,
    },
    {
      name: "Step 2",
      action: () => {
        stopAnimation(0);
        startAnimation(1);
        stopTransition();
        transitionBoxShadow(actions[1]);
        handleVoiceTrack(actions[1]);
      },
      // delay: 2000,
    },
    {
      name: "Step 3",
      action: () => {
        stopAnimation(1);
        startAnimation(2);
        stopTransition();
        transitionBoxShadow(actions[2]);
        handleVoiceTrack(actions[2]);
      },
      // delay: 1500,
    },
    {
      name: "Step 4",
      action: () => {
        stopAnimation(2);
        startAnimation(3);
        stopTransition();
        transitionBoxShadow(actions[3]);
        handleVoiceTrack(actions[3]);
      },
      // delay: 1500,
    },
    {
      name: "Step 5",
      action: () => {
        setSequenceCompleted(true);
        stopAnimation(3);
        stopTransition();
        handleVoiceTrack("finish");
      },
      // delay: 1500,
    },
  ];

  const handleFacePosition = useCallback(() => {
    if (firstStepCompleted && startActions.current) {
      setTimeout(() => {
        if (currentStep === "center") {
          setCurrentStep(mappedSteps[1].step);
          stopAnimation(0);
          startAnimation(1);
          // console.log(mappedSteps[1].step, "mappedSteps[1].step");
          transitionBoxShadow(mappedSteps[1].step);
          handleVoiceTrack(mappedSteps[1].step);
        } else if (stateMachine.current === mappedSteps[1].step) {
          setCurrentStep(mappedSteps[2].step);
          stopAnimation(1);
          startAnimation(2);

          stopTransition();
          transitionBoxShadow(mappedSteps[2].step);
          handleVoiceTrack(mappedSteps[2].step);
        } else if (stateMachine.current === mappedSteps[2].step) {
          setCurrentStep(mappedSteps[3].step);
          stopAnimation(2);
          startAnimation(3);
          stopTransition();
          transitionBoxShadow(mappedSteps[3].step);
          handleVoiceTrack(mappedSteps[3].step);
        } else if (stateMachine.current === mappedSteps[3].step) {
          setSequenceCompleted(true);
          stopAnimation(3);
          stopTransition();
        }
      }, 2000);
    }
  }, [stateMachine.current, startActions]);

  useEffect(() => {
    // handleFacePosition();
  }, [stateMachine.current]);

  const mapActionsToSteps = useCallback(() => {
    const filteredSteps = steps.filter((step) => actions.includes(step.step));
    setMappedSteps(filteredSteps);
  }, [actions, steps]);

  useEffect(() => {
    mapActionsToSteps();
  }, [actions, mapActionsToSteps]);

  useFaceMesh(
    mediaRecorderRef,
    videoRef,
    stateMachine,
    setCurrentStepIndex,
    containerRef,
    setIsFaceInCorrectPosition,
    setIsLoading,
    currentStep,
    setFirstStepCompleted,
    setRecordedChunks,
    recordedChunks
  );

  const handleStartRecording = () => {
    startActions.current = true;
    setRecordedChunks([]);
    mediaRecorderRef.current.start();
    setRecording(true);
    handleSequencesForJustHint(stepsSequences);
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const handleSaveRecording = () => {
    const blob = new Blob(recordedChunks, {
      type: "video/webm",
    });
    handleSendVideo(blob);
  };

  return (
    <>
      <div
        style={{
          marginBottom: "30px",
          display: "flex",
          justifyContent: "center",
          marginTop: "30px",
        }}
      >
        {" "}
        حرکت های مورد انتظار
      </div>
      <div className="chipContainer">
        <div className="chip" ref={(el) => (boxRef.current[0] = el)}>
          <div class="chip-content"> {actions[0]}</div>
        </div>
        <div class="chip" ref={(el) => (boxRef.current[1] = el)}>
          <div class="chip-content">{actions[1]}</div>
        </div>
        <div class="chip" ref={(el) => (boxRef.current[2] = el)}>
          <div class="chip-content">{actions[2]}</div>
        </div>
        <div class="chip" ref={(el) => (boxRef.current[3] = el)}>
          <div class="chip-content">{actions[3]}</div>
        </div>
      </div>

      <div
        className={`detection-container ${firstStepCompleted ? "" : ""} ${
          !firstStepCompleted && !isFaceInCorrectPosition ? "not-centered" : ""
        }`}
      >
        <audio ref={audioRef} src={`/${voiceTrack}`} />
        <div className="video-container active" ref={videoContainer}>
          <video ref={videoRef} width="640" height="780" autoPlay={true} />
        </div>

        {!sequenceCompleted && (
          <>
            <div className="hint">
              {mappedSteps.find((step) => step.step === currentStep)?.hint}
            </div>
          </>
        )}
        {sequenceCompleted && <div className="hint">Sequence completed!</div>}

        <div className="controls">
          {!recording && (
            <button
              onClick={handleStartRecording}
              disabled={!firstStepCompleted}
            >
              Start Recording
            </button>
          )}
          {recording && (
            <button onClick={handleStopRecording}>Stop Recording</button>
          )}
          {recordedChunks.length > 0 && (
            <button onClick={handleSaveRecording}>upload Recording</button>
          )}
        </div>
        <div>
          <FaceSvg ref={containerRef} />
        </div>
      </div>
    </>
  );
};

export default ObjectDetection;
