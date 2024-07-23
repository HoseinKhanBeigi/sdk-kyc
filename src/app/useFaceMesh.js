import react, { useEffect } from "react";
import loadFaceMesh from "./faceMesh";
export const useFaceMesh = (
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
) => {
  useEffect(() => {
    const initializeFaceMesh = async () => {
      try {
        const FaceMesh = await loadFaceMesh();
        const video = videoRef.current;
        const faceMesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        const onResults = (results) => {
          if (
            results.multiFaceLandmarks &&
            results.multiFaceLandmarks.length > 0
          ) {
            const landmarks = results.multiFaceLandmarks[0];
            // const landmarks = results.multiFaceLandmarks[0];
            const noseTip = landmarks[1]; // Nose tip
            const leftEyebrow = landmarks[70]; // Left eyebrow
            const rightEyebrow = landmarks[300]; // Right eyebrow
            const leftEyeInner = landmarks[133]; // Left eye inner corner
            const rightEyeInner = landmarks[362]; // Right eye inner corner
            const chin = landmarks[152]; // Chin
            const leftCheek = landmarks[234]; // Left cheek
            const rightCheek = landmarks[454]; // Right cheek
            const leftEar = landmarks[234]; // Left ear
            const rightEar = landmarks[454]; // Right ear

            const points = [
              leftEyeInner,
              rightEyeInner,
              leftEyebrow,
              rightEyebrow,
              noseTip,
              chin,
              leftCheek,
              rightCheek,
            ];
            const leftEye = landmarks[159]; // Left eye
            const rightEye = landmarks[386]; // Right eye
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;
            const videoCenterX = videoWidth / 2;
            const videoCenterY = videoHeight / 2;
            const toleranceX = 10; // Adjust tolerance for x as needed
            const toleranceY = 10; // Adjust tolerance for y as needed

            let headPosition = "";

            // Calculate the average x and y coordinates of the points
            const averageX =
              points.reduce((sum, point) => sum + point.x * videoWidth, 0) /
              points.length;
            const averageY =
              points.reduce((sum, point) => sum + point.y * videoHeight, 0) /
              points.length;

            if (
              Math.abs(averageX - videoCenterX) < toleranceX &&
              Math.abs(averageY - videoCenterY) < toleranceY
            ) {
              headPosition = "center";
              containerRef.current.style.stroke = "#00db5e";
              stateMachine.current = headPosition;
              setFirstStepCompleted(true);

              console.log("center");

              // containerRef.current.classList.remove("wrong");
            } else {
              if (averageX < videoCenterX - toleranceX) {
                // headPosition = "right";
                stateMachine.current = headPosition;
                setCurrentStepIndex(headPosition);
                containerRef.current.style.stroke = "red";
              } else if (averageX > videoCenterX + toleranceX) {
                // headPosition = "left";
                stateMachine.current = headPosition;
                setCurrentStepIndex(headPosition);
                containerRef.current.style.stroke = "red";
              }
              if (averageY < videoCenterY - toleranceY) {
                setCurrentStepIndex(headPosition);
                headPosition += headPosition ? " up" : "up";
                stateMachine.current = "up";
                containerRef.current.style.stroke = "red";
              } else if (averageY > videoCenterY + toleranceY) {
                headPosition += headPosition ? " down" : "down";
                stateMachine.current = "down";
                setCurrentStepIndex(headPosition);

                containerRef.current.style.stroke = "red";
              }

              if (leftCheek.x < rightCheek.x && rightCheek.x < noseTip.x) {
                headPosition = "left";
                stateMachine.current = "left";
                containerRef.current.style.stroke = "red";
              } else if (
                rightCheek.x > leftCheek.x &&
                leftCheek.x > noseTip.x
              ) {
                headPosition = "right";
                stateMachine.current = "right";
                containerRef.current.style.stroke = "red";
              }

              containerRef.current.style.stroke = "red";
            }

            // if (headPosition === "right up") {
            //   newGrid[2][0] = "1,1";
            //   setGrid(newGrid);
            // } else if (headPosition === "up") {
            //   newGrid[1][0] = "1,1";
            //   setGrid(newGrid);
            // } else if (headPosition === "center") {
            //   newGrid[1][1] = "1,1";
            //   setGrid(newGrid);
            // } else if (headPosition === "left up") {
            //   newGrid[0][0] = "1,1";
            //   setGrid(newGrid);
            // } else if (headPosition === "left") {
            //   newGrid[0][1] = "1,1";
            //   setGrid(newGrid);
            // } else if (headPosition === "right") {
            //   newGrid[2][1] = "1,1";
            //   setGrid(newGrid);
            // } else if (headPosition === "left down") {
            //   newGrid[0][2] = "1,1";
            //   setGrid(newGrid);
            // } else if (headPosition === "right down") {
            //   newGrid[2][2] = "1,1";
            //   setGrid(newGrid);
            // } else if (headPosition === "down") {
            //   newGrid[1][2] = "1,1";
            //   setGrid(newGrid);
            // }
            // Check if the head position matches the current step exactly
            if (currentStep && headPosition === currentStep) {
              setIsFaceInCorrectPosition(true);
            } else {
              setIsFaceInCorrectPosition(false);
            }
          }
        };

        const startVideo = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
            video.srcObject = stream;
            // await new Promise((resolve) => (video.onloadedmetadata = resolve));
            video.play();
            setIsLoading(false);
            setupMediaRecorder(stream);
          } catch (err) {
            console.error("Error accessing the camera: ", err);
          }
        };

        const setupMediaRecorder = (stream) => {
          const options = { mimeType: "video/webm; codecs=vp9" };
          const mediaRecorder = new MediaRecorder(stream, options);
          mediaRecorderRef.current = mediaRecorder;
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              setRecordedChunks((prev) => [...prev, event.data]);
            }
          };
          mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, {
              type: "video/mp4",
            });
          };
        };
        faceMesh.onResults(onResults);

        video.addEventListener("loadeddata", async () => {
          const detect = async () => {
            await faceMesh.send({ image: video });
            requestAnimationFrame(detect);
          };
          detect();
        });
        await startVideo();
      } catch (error) {
        console.error(error);
      }
    };

    initializeFaceMesh();
  }, []);
};
