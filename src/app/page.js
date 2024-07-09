"use client";
// src/ObjectDetection.js
import React, { useEffect, useRef, useState } from "react";
import "./index2.css";

const steps = [
  { step: "center", hint: "First, put your face in the center of the camera." },
  { step: "left", hint: "Now, turn your face to the left." },
  { step: "right", hint: "Next, turn your face to the right." },
  { step: "up", hint: "Finally, look up." },
];

const ObjectDetection = () => {
  const videoRef = useRef(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFaceInCorrectPosition, setIsFaceInCorrectPosition] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [grid, setGrid] = useState(
    Array(3)
      .fill(null)
      .map(() => Array(3).fill("0,0"))
  );

  useEffect(() => {
    const loadFaceMesh = async () => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh";
      script.async = true;
      document.body.appendChild(script);

      script.onload = async () => {
        const { FaceMesh } = window;

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

        const video = videoRef.current;

        const onResults = (results) => {
          if (
            results.multiFaceLandmarks &&
            results.multiFaceLandmarks.length > 0
          ) {
            const landmarks = results.multiFaceLandmarks[0];
            const noseTip = landmarks[1]; // Nose tip
            const leftEyebrow = landmarks[70]; // Left eyebrow
            const rightEyebrow = landmarks[300]; // Right eyebrow
            const leftEyeInner = landmarks[133]; // Left eye inner corner
            const rightEyeInner = landmarks[362]; // Right eye inner corner
            const chin = landmarks[152]; // Chin
            const leftCheek = landmarks[234]; // Left cheek
            const rightCheek = landmarks[454]; // Right cheek

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

            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;
            const videoCenterX = videoWidth / 2;
            const videoCenterY = videoHeight / 2;
            const toleranceX = 60; // Adjust tolerance for x as needed
            const toleranceY = 40; // Adjust tolerance for y as needed

            const newGrid = Array(3)
              .fill(null)
              .map(() => Array(3).fill("0,0"));
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
            } else {
              if (averageX < videoCenterX - toleranceX) {
                headPosition = "right";
              } else if (averageX > videoCenterX + toleranceX) {
                headPosition = "left";
              }
              if (averageY < videoCenterY - toleranceY) {
                headPosition += headPosition ? " up" : "up";
              } else if (averageY > videoCenterY + toleranceY) {
                headPosition += headPosition ? " down" : "down";
              }
            }

            if (headPosition === "right up") {
              newGrid[2][0] = "1,1";
              setGrid(newGrid);
            } else if (headPosition === "up") {
              newGrid[1][0] = "1,1";
              setGrid(newGrid);
            } else if (headPosition === "center") {
              newGrid[1][1] = "1,1";
              setGrid(newGrid);
            } else if (headPosition === "left up") {
              newGrid[0][0] = "1,1";
              setGrid(newGrid);
            } else if (headPosition === "left") {
              newGrid[0][1] = "1,1";
              setGrid(newGrid);
            } else if (headPosition === "right") {
              newGrid[2][1] = "1,1";
              setGrid(newGrid);
            } else if (headPosition === "left down") {
              newGrid[0][2] = "1,1";
              setGrid(newGrid);
            } else if (headPosition === "right down") {
              newGrid[2][2] = "1,1";
              setGrid(newGrid);
            } else if (headPosition === "down") {
              newGrid[1][2] = "1,1";
              setGrid(newGrid);
            }

            // console.log(`Head is in the ${headPosition}`);
          }
        };

        const startVideo = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
            video.srcObject = stream;
            await new Promise((resolve) => (video.onloadedmetadata = resolve));
            video.play();
            setIsLoading(false);
          } catch (err) {
            console.error("Error accessing the camera: ", err);
          }
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
      };
    };

    loadFaceMesh();
  }, []);

  return (
    <div className="detection-container">
      <div className="video-container">
        <video ref={videoRef} width="640" height="480" autoPlay muted />
        <div className="crosshair">
          <div className="vertical-line"></div>
          <div className="horizontal-line"></div>
        </div>
      </div>
      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <div key={cellIndex}>{cell}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ObjectDetection;
